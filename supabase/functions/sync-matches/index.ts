import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const apiFootballKey = Deno.env.get('API_FOOTBALL_KEY') || Deno.env.get('VITE_FOOTBALL_API_KEY') || '';
    const apiFootballUrl = Deno.env.get('API_FOOTBALL_URL') || Deno.env.get('VITE_FOOTBALL_API_URL') || 'https://v3.football.api-sports.io';
    const competitionCode = Deno.env.get('API_FOOTBALL_COMPETITION_CODE') || Deno.env.get('VITE_FOOTBALL_COMPETITION_CODE') || 'WC';
    const season = Deno.env.get('API_FOOTBALL_SEASON') || Deno.env.get('VITE_FOOTBALL_SEASON') || '2026';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get active tournament
    let { data: tournaments } = await supabase
      .from('tournaments')
      .select('id')
      .eq('is_active', true)
      .limit(1);

    let tournamentId = tournaments?.[0]?.id;
    if (!tournamentId) {
      // Create a default tournament
      const { data: newTournament } = await supabase
        .from('tournaments')
        .insert({
          name: 'FIFA World Cup 2026',
          year: 2026,
          start_date: '2026-06-11',
          end_date: '2026-07-19',
          is_active: true
        })
        .select('id')
        .single();
      
      if (newTournament) {
        tournamentId = newTournament.id;
      } else {
        throw new Error('Failed to find or create an active tournament');
      }
    }

    let resolvedCompetitionCode = competitionCode;
    let resolvedSeason = season;

    try {
      const body = await req.json();
      if (body.competitionCode) resolvedCompetitionCode = String(body.competitionCode);
      if (body.season) resolvedSeason = String(body.season);
    } catch (_) {
      // No body or invalid JSON, use defaults
    }

    let url = `${apiFootballUrl}/fixtures?league=${resolvedCompetitionCode}&season=${resolvedSeason}`;
    if (apiFootballUrl.includes('football-data.org')) {
      url = `${apiFootballUrl}/competitions/${resolvedCompetitionCode}/matches?season=${resolvedSeason}`;
    }

    const headers: Record<string, string> = {};
    if (apiFootballKey) {
      if (apiFootballUrl.includes('football-data.org')) {
        headers['X-Auth-Token'] = apiFootballKey;
      } else {
        headers['x-apisports-key'] = apiFootballKey;
      }
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API Football returned status ${response.status}`);
    }

    const data = await response.json();
    
    // Load existing teams to avoid duplicate checks
    const { data: dbTeams } = await supabase.from('teams').select('id, name, code');
    const teamMapByCode = new Map(dbTeams?.map(t => [t.code.toLowerCase(), t.id]) || []);
    const teamMapByName = new Map(dbTeams?.map(t => [t.name.toLowerCase(), t.id]) || []);

    const countryToCode: Record<string, string> = {
      'colombia': 'co',
      'argentina': 'ar',
      'brasil': 'br',
      'brazil': 'br',
      'uruguay': 'uy',
      'paraguay': 'py',
      'chile': 'cl',
      'peru': 'pe',
      'perú': 'pe',
      'ecuador': 'ec',
      'venezuela': 've',
      'bolivia': 'bo',
      'canadá': 'ca',
      'canada': 'ca',
      'estados unidos': 'us',
      'usa': 'us',
      'mexico': 'mx',
      'méxico': 'mx',
      'jamaica': 'jm',
      'costa rica': 'cr',
      'panama': 'pa',
      'panamá': 'pa'
    };

    let syncedCount = 0;
    
    if (data.response && Array.isArray(data.response)) {
      // API-Football response format
      for (const item of data.response) {
        const fixture = item.fixture;
        const teams = item.teams;
        const goals = item.goals;
        const leagueInfo = item.league;

        if (!fixture || !teams || !teams.home || !teams.away) continue;

        const extId = String(fixture.id);
        const matchDate = fixture.date;
        const stage = leagueInfo.round || 'Grupo';
        const status = mapStatus(fixture.status?.short || 'NS');
        const homeScore = goals.home !== null && goals.home !== undefined ? Number(goals.home) : null;
        const awayScore = goals.away !== null && goals.away !== undefined ? Number(goals.away) : null;

        // Process Home Team
        let homeTeamId = teamMapByName.get(teams.home.name.toLowerCase()) || 
                         (teams.home.code && teamMapByCode.get(teams.home.code.toLowerCase()));
        if (!homeTeamId) {
          const code = countryToCode[teams.home.name.toLowerCase()] || 
                       teams.home.code?.toLowerCase() || 
                       teams.home.name.substring(0, 3).toLowerCase();
          const { data: newTeam } = await supabase
            .from('teams')
            .insert({
              name: teams.home.name,
              code,
              flag_url: teams.home.logo || `https://flagcdn.com/${code}.svg`
            })
            .select('id')
            .single();
          if (newTeam) {
            homeTeamId = newTeam.id;
            teamMapByName.set(teams.home.name.toLowerCase(), homeTeamId);
            teamMapByCode.set(code, homeTeamId);
          }
        }

        // Process Away Team
        let awayTeamId = teamMapByName.get(teams.away.name.toLowerCase()) || 
                         (teams.away.code && teamMapByCode.get(teams.away.code.toLowerCase()));
        if (!awayTeamId) {
          const code = countryToCode[teams.away.name.toLowerCase()] || 
                       teams.away.code?.toLowerCase() || 
                       teams.away.name.substring(0, 3).toLowerCase();
          const { data: newTeam } = await supabase
            .from('teams')
            .insert({
              name: teams.away.name,
              code,
              flag_url: teams.away.logo || `https://flagcdn.com/${code}.svg`
            })
            .select('id')
            .single();
          if (newTeam) {
            awayTeamId = newTeam.id;
            teamMapByName.set(teams.away.name.toLowerCase(), awayTeamId);
            teamMapByCode.set(code, awayTeamId);
          }
        }

        if (homeTeamId && awayTeamId) {
          // Upsert Match
          const matchPayload = {
            tournament_id: tournamentId,
            external_id: extId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            match_date: matchDate,
            stage: stage,
            status: status,
            home_score: homeScore,
            away_score: awayScore
          };

          // Find if match already exists by external_id
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('id')
            .eq('external_id', extId)
            .maybeSingle();

          if (existingMatch) {
            await supabase
              .from('matches')
              .update(matchPayload)
              .eq('id', existingMatch.id);
          } else {
            await supabase
              .from('matches')
              .insert(matchPayload);
          }
          syncedCount++;
        }
      }
    } else if (data.matches && Array.isArray(data.matches)) {
      // Football-Data.org response format
      for (const m of data.matches) {
        const extId = String(m.id);
        const matchDate = m.utcDate;
        let stage = m.stage || 'Grupo';
        if (m.stage === 'GROUP_STAGE' && m.group) {
          stage = m.group.replace('GROUP_', 'Group ');
        }
        
        const status = mapStatus(m.status); // Usa la misma función para ambos formatos

        let homeScore = m.score?.fullTime?.home !== null && m.score?.fullTime?.home !== undefined ? Number(m.score.fullTime.home) : null;
        let awayScore = m.score?.fullTime?.away !== null && m.score?.fullTime?.away !== undefined ? Number(m.score.fullTime.away) : null;

        // If it ended in penalties, football-data.org fullTime score includes penalties (e.g. 5-6).
        // For predictions, we want the score at the end of the match (regular time + extra time).
        if (m.score?.duration === 'PENALTY_SHOOTOUT') {
          const regHome = m.score?.regularTime?.home !== null && m.score?.regularTime?.home !== undefined ? Number(m.score.regularTime.home) : 0;
          const regAway = m.score?.regularTime?.away !== null && m.score?.regularTime?.away !== undefined ? Number(m.score.regularTime.away) : 0;
          const extHome = m.score?.extraTime?.home !== null && m.score?.extraTime?.home !== undefined ? Number(m.score.extraTime.home) : 0;
          const extAway = m.score?.extraTime?.away !== null && m.score?.extraTime?.away !== undefined ? Number(m.score.extraTime.away) : 0;
          homeScore = regHome + extHome;
          awayScore = regAway + extAway;
        }

        const homeName = m.homeTeam?.name;
        const homeCode = m.homeTeam?.tla || '';
        const homeLogo = m.homeTeam?.crest;

        const awayName = m.awayTeam?.name;
        const awayCode = m.awayTeam?.tla || '';
        const awayLogo = m.awayTeam?.crest;

        if (!homeName || !awayName) continue;

        // Process Home Team
        let homeTeamId = teamMapByName.get(homeName.toLowerCase()) || 
                         (homeCode && teamMapByCode.get(homeCode.toLowerCase()));
        if (!homeTeamId) {
          const code = countryToCode[homeName.toLowerCase()] || 
                       homeCode.toLowerCase() || 
                       homeName.substring(0, 3).toLowerCase();
          const { data: newTeam } = await supabase
            .from('teams')
            .insert({
              name: homeName,
              code,
              flag_url: homeLogo || `https://flagcdn.com/${code}.svg`
            })
            .select('id')
            .single();
          if (newTeam) {
            homeTeamId = newTeam.id;
            teamMapByName.set(homeName.toLowerCase(), homeTeamId);
            teamMapByCode.set(code, homeTeamId);
          }
        }

        // Process Away Team
        let awayTeamId = teamMapByName.get(awayName.toLowerCase()) || 
                         (awayCode && teamMapByCode.get(awayCode.toLowerCase()));
        if (!awayTeamId) {
          const code = countryToCode[awayName.toLowerCase()] || 
                       awayCode.toLowerCase() || 
                       awayName.substring(0, 3).toLowerCase();
          const { data: newTeam } = await supabase
            .from('teams')
            .insert({
              name: awayName,
              code,
              flag_url: awayLogo || `https://flagcdn.com/${code}.svg`
            })
            .select('id')
            .single();
          if (newTeam) {
            awayTeamId = newTeam.id;
            teamMapByName.set(awayName.toLowerCase(), awayTeamId);
            teamMapByCode.set(code, awayTeamId);
          }
        }

        if (homeTeamId && awayTeamId) {
          // Upsert Match
          const matchPayload = {
            tournament_id: tournamentId,
            external_id: extId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            match_date: matchDate,
            stage: stage,
            status: status,
            home_score: homeScore,
            away_score: awayScore
          };

          const { data: existingMatch } = await supabase
            .from('matches')
            .select('id')
            .eq('external_id', extId)
            .maybeSingle();

          if (existingMatch) {
            await supabase
              .from('matches')
              .update(matchPayload)
              .eq('id', existingMatch.id);
          } else {
            await supabase
              .from('matches')
              .insert(matchPayload);
          }
          syncedCount++;
        }
      }
    }

    // Fallback de seguridad: Autocambiar a 'live' partidos que ya empezaron pero siguen marcados 'scheduled'
    const nowIso = new Date().toISOString();
    await supabase
      .from('matches')
      .update({ status: 'live' })
      .eq('status', 'scheduled')
      .lte('match_date', nowIso);

    // Retorna ambas propiedades para compatibilidad total con el frontend
    return new Response(JSON.stringify({ 
      success: true, 
      synced: syncedCount,
      syncedMatchesCount: syncedCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function mapStatus(apiStatus: string): 'scheduled' | 'live' | 'finished' {
  const s = apiStatus.toUpperCase();
  if (['FT', 'AET', 'PEN', 'FINISHED'].includes(s)) return 'finished';
  if (['NS', 'TBD', 'SCHEDULED', 'TIMED'].includes(s)) return 'scheduled';
  return 'live';
}