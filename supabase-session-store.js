import session from 'express-session';

const Store = session.Store;

/**
 * Small express-session store backed by Supabase Postgres.
 * The server uses the service-role client, so this table must never be
 * exposed through a client-side Supabase key.
 */
export class SupabaseSessionStore extends Store {
  constructor({ supabase, ttlMs = 1000 * 60 * 60 * 12 } = {}) {
    super();
    if (!supabase) throw new Error('SupabaseSessionStore requires a Supabase client.');
    this.supabase = supabase;
    this.ttlMs = ttlMs;
  }

  get(sid, callback) {
    this.supabase
      .from('admin_sessions')
      .select('sess,expire')
      .eq('sid', sid)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) return callback(error);
        if (!data) return callback(null, null);
        const expiresAt = new Date(data.expire).getTime();
        if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
          await this.supabase.from('admin_sessions').delete().eq('sid', sid);
          return callback(null, null);
        }
        callback(null, data.sess);
      })
      .catch(callback);
  }

  set(sid, sess, callback) {
    const expiresAt = sess?.cookie?.expires
      ? new Date(sess.cookie.expires)
      : new Date(Date.now() + this.ttlMs);
    this.supabase
      .from('admin_sessions')
      .upsert({ sid, sess, expire: expiresAt.toISOString() }, { onConflict: 'sid' })
      .then(({ error }) => callback(error || null))
      .catch(callback);
  }

  destroy(sid, callback) {
    this.supabase
      .from('admin_sessions')
      .delete()
      .eq('sid', sid)
      .then(({ error }) => callback(error || null))
      .catch(callback);
  }

  touch(sid, sess, callback) {
    const expiresAt = sess?.cookie?.expires
      ? new Date(sess.cookie.expires)
      : new Date(Date.now() + this.ttlMs);
    this.supabase
      .from('admin_sessions')
      .update({ expire: expiresAt.toISOString() })
      .eq('sid', sid)
      .then(({ error }) => callback(error || null))
      .catch(callback);
  }
}
