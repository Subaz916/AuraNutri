/* =============================================================================
   AuraNutri — Supabase Client & Data Layer
   ─────────────────────────────────────────
   HOW TO CONFIGURE:
   1. Go to https://app.supabase.com → Your Project → Settings → API
   2. Copy "Project URL" and "anon public" key below.
   3. Run supabase-schema.sql in your Supabase SQL Editor first.
   ============================================================================= */

const SUPABASE_URL  = 'https://egoqjnxdqegicazdyplh.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnb3FqbnhkcWVnaWNhemR5cGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzE4MjgsImV4cCI6MjEwMDkwNzgyOH0.CHvoP1VSx_hJ-QKZLv1nisorG6vK2b7eauJbl0_DgOI';

/* ─── Supabase JS v2 CDN client ─── */
const { createClient } = window.supabase;
const _sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// Expose config to window so reset helper can use it
window._SUPABASE_URL  = SUPABASE_URL;
window._SUPABASE_ANON = SUPABASE_ANON;

/* ─────────────────────────────────────────────────────────────────────────────
   DEVICE / ANONYMOUS USER ID
   ───────────────────────────────────────────────────────────────────────────── */
function getDeviceUserId() {
  return 'shared-kcal-tracker-user';
}

const USER_ID = getDeviceUserId();

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER
   ───────────────────────────────────────────────────────────────────────────── */
async function sbQuery(promise) {
  const { data, error } = await promise;
  if (error) {
    console.error('[Supabase Error]', error.message, error);
    throw error;
  }
  return data;
}

/* =============================================================================
   EXPOSE ALL FUNCTIONS AS window.SupabaseDB
   (Replaces ES module exports — compatible with non-module script loading)
   ============================================================================= */
window.SupabaseDB = {

  /* ── USER PROFILE ── */
  async loadProfile() {
    let { data, error } = await _sb
      .from('user_profile')
      .select('*')
      .eq('user_id', USER_ID)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const defaults = {
        user_id: USER_ID,
        version: '1.0',
        goal_kcal: 2000,
        goal_protein: 150,
        goal_carbs: 200,
        goal_fat: 65,
        weight: 75.0,
        target_weight: 68.0,
        height: 175,
        age: 28,
        gender: 'male',
        activity: 'moderate',
        theme: 'dark',
        accent_color: '#3B82F6',
        animations_enabled: true,
        compact_mode: false,
        backup_reminder: true,
        custom_units: []
      };
      data = await sbQuery(_sb.from('user_profile').insert(defaults).select().single());
    }

    return data;
  },

  async saveGoals(goals) {
    return sbQuery(_sb.from('user_profile').update({
      goal_kcal:     goals.kcal,
      goal_protein:  goals.protein,
      goal_carbs:    goals.carbs,
      goal_fat:      goals.fat,
      weight:        goals.weight,
      target_weight: goals.targetWeight,
      height:        goals.height,
      age:           goals.age,
      gender:        goals.gender,
      activity:      goals.activity
    }).eq('user_id', USER_ID));
  },

  async saveSettings(settings) {
    return sbQuery(_sb.from('user_profile').update({
      theme:              settings.theme,
      accent_color:       settings.accentColor,
      animations_enabled: settings.animationsEnabled,
      compact_mode:       settings.compactMode,
      backup_reminder:    settings.backupReminder,
      custom_units:       settings.customUnits
    }).eq('user_id', USER_ID));
  },

  /* ── QUICK FOODS ── */
  async loadQuickFoods() {
    const rows = await sbQuery(
      _sb.from('quick_foods')
         .select('*')
         .eq('user_id', USER_ID)
         .order('created_at', { ascending: true })
     );

    return rows.map(r => ({
      id:              r.id,
      name:            r.name,
      defaultQuantity: Number(r.default_quantity),
      unit:            r.unit,
      calories:        r.calories,
      protein:         Number(r.protein),
      carbs:           Number(r.carbs),
      fat:             Number(r.fat),
      category:        r.category,
      icon:            r.icon,
      favorite:        r.favorite
    }));
  },

  async insertQuickFood(food) {
    const row = await sbQuery(
      _sb.from('quick_foods').insert({
        user_id:          USER_ID,
        name:             food.name,
        default_quantity: food.defaultQuantity,
        unit:             food.unit,
        calories:         food.calories,
        protein:          food.protein,
        carbs:            food.carbs,
        fat:              food.fat,
        category:         food.category,
        icon:             food.icon || '🥗',
        favorite:         food.favorite || false
      }).select().single()
    );
    return { ...food, id: row.id };
  },

  async updateQuickFood(id, food) {
    const update = {};
    if (food.name             !== undefined) update.name             = food.name;
    if (food.defaultQuantity  !== undefined) update.default_quantity = food.defaultQuantity;
    if (food.unit             !== undefined) update.unit             = food.unit;
    if (food.calories         !== undefined) update.calories         = food.calories;
    if (food.protein          !== undefined) update.protein          = food.protein;
    if (food.carbs            !== undefined) update.carbs            = food.carbs;
    if (food.fat              !== undefined) update.fat              = food.fat;
    if (food.category         !== undefined) update.category         = food.category;
    if (food.icon             !== undefined) update.icon             = food.icon;
    if (food.favorite         !== undefined) update.favorite         = food.favorite;

    return sbQuery(_sb.from('quick_foods').update(update).eq('id', id).eq('user_id', USER_ID));
  },

  async deleteQuickFood(id) {
    return sbQuery(_sb.from('quick_foods').delete().eq('id', id).eq('user_id', USER_ID));
  },

  async bulkInsertStarterFoods(foods) {
    const rows = foods.map(f => ({
      user_id:          USER_ID,
      name:             f.name,
      default_quantity: f.defaultQuantity,
      unit:             f.unit,
      calories:         f.calories,
      protein:          f.protein,
      carbs:            f.carbs,
      fat:              f.fat,
      category:         f.category,
      icon:             f.icon || '🥗',
      favorite:         false
    }));
    const inserted = await sbQuery(_sb.from('quick_foods').insert(rows).select());
    return inserted.map((r, i) => ({ ...foods[i], id: r.id, favorite: false }));
  },

  /* ── DAILY RECORDS (water + weight) ── */
  async loadDailyRecords() {
    const rows = await sbQuery(
      _sb.from('daily_records')
         .select('*')
         .eq('user_id', USER_ID)
         .order('log_date', { ascending: true })
    );

    const map = {};
    rows.forEach(r => {
      map[r.log_date] = {
        water:  r.water_ml,
        weight: r.weight_kg ? Number(r.weight_kg) : null,
        foods:  []
      };
    });
    return map;
  },

  async upsertDailyRecord(dateStr, { water, weight }) {
    return sbQuery(_sb.from('daily_records').upsert({
      user_id:   USER_ID,
      log_date:  dateStr,
      water_ml:  water  ?? 0,
      weight_kg: weight ?? null
    }, { onConflict: 'user_id,log_date' }));
  },

  /* ── FOOD LOG ENTRIES ── */
  async loadFoodLogEntries() {
    const rows = await sbQuery(
      _sb.from('food_log_entries')
         .select('*')
         .eq('user_id', USER_ID)
         .order('log_date', { ascending: true })
         .order('created_at', { ascending: true })
    );

    const map = {};
    rows.forEach(r => {
      if (!map[r.log_date]) map[r.log_date] = [];
      map[r.log_date].push({
        id:       r.id,
        name:     r.name,
        quantity: Number(r.quantity),
        unit:     r.unit,
        calories: r.calories,
        protein:  Number(r.protein),
        carbs:    Number(r.carbs),
        fat:      Number(r.fat),
        category: r.category,
        time:     r.log_time,
        notes:    r.notes
      });
    });
    return map;
  },

  async insertFoodLogEntry(dateStr, entry) {
    const row = await sbQuery(
      _sb.from('food_log_entries').insert({
        user_id:  USER_ID,
        log_date: dateStr,
        name:     entry.name,
        quantity: entry.quantity,
        unit:     entry.unit,
        calories: entry.calories,
        protein:  entry.protein,
        carbs:    entry.carbs,
        fat:      entry.fat,
        category: entry.category,
        log_time: entry.time || '12:00',
        notes:    entry.notes || ''
      }).select().single()
    );
    return { ...entry, id: row.id };
  },

  async deleteFoodLogEntry(id) {
    return sbQuery(_sb.from('food_log_entries').delete().eq('id', id).eq('user_id', USER_ID));
  },

  async updateFoodLogEntry(id, entry) {
    return sbQuery(_sb.from('food_log_entries').update({
      name:     entry.name,
      quantity: entry.quantity,
      unit:     entry.unit,
      calories: entry.calories,
      protein:  entry.protein,
      carbs:    entry.carbs,
      fat:      entry.fat,
      category: entry.category,
      log_time: entry.time || '12:00',
      notes:    entry.notes || ''
    }).eq('id', id).eq('user_id', USER_ID));
  },

  /* ── FULL DATA EXPORT ── */
  async exportAllData() {
    const [profile, quickFoods, dailyRecs, foodLogs] = await Promise.all([
      window.SupabaseDB.loadProfile(),
      window.SupabaseDB.loadQuickFoods(),
      window.SupabaseDB.loadDailyRecords(),
      window.SupabaseDB.loadFoodLogEntries()
    ]);

    const mergedRecords = { ...dailyRecs };
    Object.keys(foodLogs).forEach(date => {
      if (!mergedRecords[date]) mergedRecords[date] = { water: 0, weight: null, foods: [] };
      mergedRecords[date].foods = foodLogs[date];
    });

    return {
      exportedAt: new Date().toISOString(),
      userId: USER_ID,
      profile,
      quickFoods,
      records: mergedRecords
    };
  },

  /* ── FULL DATA IMPORT ── */
  async importAllData(jsonData) {
    if (jsonData.goals) await window.SupabaseDB.saveGoals(jsonData.goals);
    if (jsonData.settings) await window.SupabaseDB.saveSettings(jsonData.settings);

    if (jsonData.quickFoods && jsonData.quickFoods.length > 0) {
      await sbQuery(_sb.from('quick_foods').delete().eq('user_id', USER_ID));
      await window.SupabaseDB.bulkInsertStarterFoods(jsonData.quickFoods);
    }

    if (jsonData.records) {
      for (const [dateStr, rec] of Object.entries(jsonData.records)) {
        await window.SupabaseDB.upsertDailyRecord(dateStr, { water: rec.water || 0, weight: rec.weight || null });
        await sbQuery(_sb.from('food_log_entries').delete()
          .eq('user_id', USER_ID).eq('log_date', dateStr));

        if (rec.foods && rec.foods.length > 0) {
          const rows = rec.foods.map(f => ({
            user_id:  USER_ID,
            log_date: dateStr,
            name:     f.name,
            quantity: f.quantity,
            unit:     f.unit,
            calories: f.calories,
            protein:  f.protein,
            carbs:    f.carbs,
            fat:      f.fat,
            category: f.category,
            log_time: f.time || '12:00',
            notes:    f.notes || ''
          }));
          await sbQuery(_sb.from('food_log_entries').insert(rows));
        }
      }
    }
  },

  /* ── REAL-TIME SUBSCRIPTIONS ── */
  subscribeToDateLogs(dateStr, onUpdate) {
    return _sb
      .channel(`food_log_${dateStr}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'food_log_entries',
          filter: `user_id=eq.${USER_ID}` },
        async () => {
          const all = await window.SupabaseDB.loadFoodLogEntries();
          onUpdate(all[dateStr] || []);
        }
      )
      .subscribe();
  },

  /* ── SECURITY Snapshot logging ── */
  async logLoginAttempt(attempt) {
    try {
      const { data, error } = await _sb
        .from('login_attempts')
        .insert({
          success: attempt.success,
          image_url: attempt.imageUrl,
          browser: attempt.browser,
          operating_system: attempt.operatingSystem,
          screen_resolution: attempt.screenResolution,
          timezone: attempt.timezone,
          ip_address: attempt.ipAddress || null,
          timestamp: new Date().toISOString()
        })
        .select();
      if (error) {
        console.error('[Supabase logLoginAttempt Error]', error);
        // Do not crash the app, just return null
        return null;
      }
      return data;
    } catch (err) {
      console.error('[logLoginAttempt catch error]', err);
      return null;
    }
  },

  /* Expose USER_ID */
  USER_ID
};
