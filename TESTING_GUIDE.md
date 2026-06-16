# 🧪 GUÍA DE PRUEBAS DE AUTOMATIZACIÓN
## Polla Mundialista Familiar Rincón

Esta guía detalla cómo verificar que el sistema de bloqueo de pronósticos y el cálculo de puntos funcionen automáticamente y sin supervisión.

---

## 1. Validación de Bloqueo de Pronósticos

### Prueba 1: Bloqueo Visual (Frontend)
1. Ve a la base de datos y cambia la fecha de un partido para que sea 10 minutos en el pasado:
   ```sql
   UPDATE matches SET match_date = NOW() - INTERVAL '10 minutes' WHERE id = 'ID_DEL_PARTIDO';
   ```
2. Navega al **Dashboard**.
3. **Resultado esperado**: El partido debe aparecer con la tarjeta opaca, los inputs deshabilitados y el botón con el texto "Pronóstico Bloqueado".

### Prueba 2: Bloqueo de Base de Datos (Seguridad)
1. Intenta insertar un pronóstico manualmente por SQL para un partido que ya comenzó:
   ```sql
   INSERT INTO predictions (participant_id, match_id, predicted_home, predicted_away)
   VALUES ('ID_PARTICIPANTE', 'ID_PARTIDO_PASADO', 2, 1);
   ```
2. **Resultado esperado**: Supabase debe devolver un error: `"No se pueden realizar o modificar pronósticos una vez que el partido ha comenzado"`.

---

## 2. Validación de Sumatoria Automática (Scoring)

### Prueba 3: Procesamiento de Resultados
1. Asegúrate de tener al menos un participante con un pronóstico para un partido específico.
2. Actualiza el resultado del partido y cámbialo a `finished`:
   ```sql
   UPDATE matches 
   SET home_score = 2, away_score = 1, status = 'finished' 
   WHERE id = 'ID_DEL_PARTIDO';
   ```
3. **Resultado esperado**:
   - La tabla `participant_points` debe llenarse automáticamente con los puntos calculados.
   - La tabla `audit_logs` debe registrar el cambio.
   - Al entrar a la página de **Ranking**, el puntaje del participante debe haberse actualizado.

---

## 3. Validación de Sincronización API

### Prueba 4: Simulación de Sincronización
1. Ejecuta la Edge Function `sync-matches` manualmente desde el panel de Supabase o mediante un comando `curl`.
2. Verifica que los partidos se actualicen con los resultados reales de la API de fútbol.
3. **Resultado esperado**: Si la API reporta un partido como finalizado, el disparador de la base de datos se activará solo y repartirá los puntos sin que nadie tenga que presionar un botón.

---

## 4. Comandos de Utilidad para Pruebas

### Limpiar puntos para volver a probar
```sql
DELETE FROM participant_points;
UPDATE matches SET status = 'scheduled', home_score = NULL, away_score = NULL;
```

### Recalcular todo (Si algo falla)
```sql
SELECT recalculate_all_rankings();
```

---

**Nota**: En producción, asegúrate de que la extensión `pg_cron` esté activa en Supabase o usa un servicio externo (como GitHub Actions o un Cron Job de Supabase) para llamar a la función `sync-matches` cada 15 minutos.
