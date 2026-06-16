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
    const { data: dbTeams } = await supabase.from('teams').select('id, name, code, flag_url');
    const teamMapByCode = new Map(dbTeams?.map(t => [t.code.toLowerCase(), t.id]) || []);
    const teamMapByName = new Map(dbTeams?.map(t => [t.name.toLowerCase(), t.id]) || []);
    const teamFlagMap = new Map(dbTeams?.map(t => [t.id, t.flag_url]) || []);

    const countryToCode: Record<string, string> = {
      // Sudamérica (CONMEBOL)
      'colombia': 'co', 'argentina': 'ar', 'brasil': 'br', 'brazil': 'br', 'uruguay': 'uy',
      'paraguay': 'py', 'chile': 'cl', 'peru': 'pe', 'perú': 'pe', 'ecuador': 'ec', 'venezuela': 've', 'bolivia': 'bo',
      // Norte y Centroamérica (CONCACAF)
      'canadá': 'ca', 'canada': 'ca', 'estados unidos': 'us', 'usa': 'us', 'united states': 'us',
      'mexico': 'mx', 'méxico': 'mx', 'jamaica': 'jm', 'costa rica': 'cr', 'panama': 'pa', 'panamá': 'pa',
      'haiti': 'ht', 'haití': 'ht', 'curaçao': 'cw', 'curacao': 'cw',
      // Europa (UEFA)
      'germany': 'de', 'alemania': 'de', 'spain': 'es', 'españa': 'es', 'france': 'fr', 'francia': 'fr',
      'england': 'gb-eng', 'inglaterra': 'gb-eng', 'scotland': 'gb-sct', 'escocia': 'gb-sct',
      'belgium': 'be', 'bélgica': 'be', 'austria': 'at', 'croatia': 'hr', 'croacia': 'hr',
      'czechia': 'cz', 'república checa': 'cz', 'netherlands': 'nl', 'países bajos': 'nl',
      'norway': 'no', 'noruega': 'no', 'portugal': 'pt', 'sweden': 'se', 'suecia': 'se',
      'switzerland': 'ch', 'suiza': 'ch', 'turkey': 'tr', 'turquía': 'tr', 'bosnia-herzegovina': 'ba',
      // África (CAF)
      'algeria': 'dz', 'argelia': 'dz', 'cape verde': 'cv', 'cape verde islands': 'cv', 'cabo verde': 'cv',
      'congo dr': 'cd', 'rd congo': 'cd', 'egypt': 'eg', 'egipto': 'eg', 'ghana': 'gh',
      'ivory coast': 'ci', 'costa de marfil': 'ci', 'morocco': 'ma', 'marruecos': 'ma', 'senegal': 'sn',
      'south africa': 'za', 'sudáfrica': 'za', 'tunisia': 'tn', 'túnez': 'tn',
      // Asia y Oceanía (AFC / OFC)
      'australia': 'au', 'iran': 'ir', 'irán': 'ir', 'iraq': 'iq', 'irak': 'iq', 'japan': 'jp', 'japón': 'jp',
      'jordan': 'jo', 'jordania': 'jo', 'qatar': 'qa', 'saudi arabia': 'sa', 'arabia saudita': 'sa',
      'south korea': 'kr', 'corea del sur': 'kr', 'uzbekistan': 'uz', 'uzbekistán': 'uz', 'new zealand': 'nz', 'nueva zelanda': 'nz'
    };

    let syncedCount = 0;

    // Helper function para procesar, insertar o actualizar equipos dinámicamente con su URL real
    async function processTeam(name: string, apiCode: string | null, apiLogo: string | null) {
      if (!name) return null;
      
      const lowerName = name.toLowerCase();
      const lowerCode = apiCode?.toLowerCase() || '';
      
      let teamId = teamMapByName.get(lowerName) || (lowerCode && teamMapByCode.get(lowerCode));
      
      const fallbackCode = countryToCode[lowerName] || lowerCode || name.substring(0, 3).toLowerCase();
      const finalFlagUrl = apiLogo || `https://flagcdn.com/${fallbackCode}.svg`;

      if (!teamId) {
        // El equipo no existe, se crea con la URL directa de la API
        const { data: newTeam } = await supabase
          .from('teams')
          .insert({
            name: name,
            code: fallbackCode,
            flag_url: finalFlagUrl
          })
          .select('id')
          .single();

        if (newTeam) {
          teamId = newTeam.id;
          teamMapByName.set(lowerName, teamId);
          teamMapByCode.set(fallbackCode, teamId);
          teamFlagMap.set(teamId, finalFlagUrl);
        }
      } else {
        // Si el equipo existe pero no tiene flag_url o tiene el fallback antiguo de flagcdn, lo actualizamos con el logo real de la API
        const currentFlag = teamFlagMap.get(teamId);
        if (apiLogo && (!currentFlag || currentFlag.includes('flagcdn.com'))) {
          await supabase
            .from('teams')
            .update({ flag_url: apiLogo })
            .eq('id', teamId);
          teamFlagMap.set(teamId, apiLogo);
        }
      }
      return teamId;
    }
    
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

        const homeTeamId = await processTeam(teams.home.name, teams.home.code, teams.home.logo);
        const awayTeamId = await processTeam(teams.away.name, teams.away.code, teams.away.logo);

        if (homeTeamId && awayTeamId) {
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
            await supabase.from('matches').update(matchPayload).eq('id', existingMatch.id);
          } else {
            await supabase.from('matches').insert(matchPayload);
          }
          syncedCount++;
        }
      }
    } else if (data.matches && Array.isArray(data.matches)) {
      // Football-Data.org response format
      for (const m of data.matches) {
        const extId = String(m.id);
        const matchDate = m.utcDate;
        const stage = m.stage || 'Grupo';
        
        let status: 'scheduled' | 'live' | 'finished' = 'scheduled';
        if (m.status === 'FINISHED') status = 'finished';
        else if (m.status === 'IN_PLAY' || m.status === 'PAUSED') status = 'live';

        const homeScore = m.score?.fullTime?.home !== null && m.score?.fullTime?.home !== undefined ? Number(m.score.fullTime.home) : null;
        const awayScore = m.score?.fullTime?.away !== null && m.score?.fullTime?.away !== undefined ? Number(m.score.fullTime.away) : null;

        const homeTeamId = await processTeam(m.homeTeam?.name, m.homeTeam?.tla, m.homeTeam?.crest);
        const awayTeamId = await processTeam(m.awayTeam?.name, m.awayTeam?.tla, m.awayTeam?.crest);

        if (homeTeamId && awayTeamId) {
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
            await supabase.from('matches').update(matchPayload).eq('id', existingMatch.id);
          } else {
            await supabase.from('matches').insert(matchPayload);
          }
          syncedCount++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, syncedMatchesCount: syncedCount }), {
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
  if (['FT', 'AET', 'PEN'].includes(s)) return 'finished';
  if (['NS', 'TBD'].includes(s)) return 'scheduled';
  return 'live';
}