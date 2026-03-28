/**
 * Dungeon Mania — camada de dados local (v16)
 * Persistência via localStorage (sem servidor). Em produção, troque por API + DB real.
 *
 * Chaves:
 * - dm_v16_db        → { users[], global{ killsW1, killsW2 } }
 * - dm_v16_session   → { username, role } | null
 */
(function (global) {
    const STORAGE_DB = 'dm_v16_db';
    const STORAGE_SESSION = 'dm_v16_session';

    function readDb() {
        try {
            const raw = localStorage.getItem(STORAGE_DB);
            if (!raw) return { users: [], global: { killsW1: 0, killsW2: 0 } };
            const o = JSON.parse(raw);
            if (!o.users) o.users = [];
            if (!o.global) o.global = { killsW1: 0, killsW2: 0 };
            if (o.global.killsW1 == null) o.global.killsW1 = 0;
            if (o.global.killsW2 == null) o.global.killsW2 = 0;
            return o;
        } catch (e) {
            return { users: [], global: { killsW1: 0, killsW2: 0 } };
        }
    }

    function writeDb(db) {
        localStorage.setItem(STORAGE_DB, JSON.stringify(db));
    }

    function ensureAdminUser() {
        const db = readDb();
        const hasAdmin = db.users.some(u => u.role === 'admin');
        if (!hasAdmin) {
            db.users.push({
                id: 'admin-' + Date.now(),
                name: 'admin',
                pass: 'admin',
                role: 'admin'
            });
            writeDb(db);
        }
    }

    const DMDB = {
        init() {
            ensureAdminUser();
        },

        getUsers() {
            return readDb().users.slice();
        },

        /** Login local: retorna { ok, user } */
        login(name, pass) {
            const db = readDb();
            const u = db.users.find(x => x.name === name && x.pass === pass);
            if (!u) return { ok: false, error: 'Usuário ou senha inválidos.' };
            const session = { username: u.name, role: u.role };
            localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
            return { ok: true, user: session };
        },

        logout() {
            localStorage.removeItem(STORAGE_SESSION);
        },

        getSession() {
            try {
                const raw = localStorage.getItem(STORAGE_SESSION);
                if (!raw) return null;
                return JSON.parse(raw);
            } catch (e) {
                return null;
            }
        },

        register(name, pass) {
            const db = readDb();
            if (db.users.some(u => u.name === name)) return { ok: false, error: 'Nome já existe.' };
            db.users.push({
                id: 'u-' + Date.now(),
                name,
                pass,
                role: 'player'
            });
            writeDb(db);
            return { ok: true };
        },

        isAdmin() {
            const s = this.getSession();
            return s && s.role === 'admin';
        },

        getGlobal() {
            return { ...readDb().global };
        },

        saveGlobal(g) {
            const db = readDb();
            db.global = { ...db.global, ...g };
            writeDb(db);
        },

        incrementKill(worldId) {
            const db = readDb();
            if (worldId === 1) db.global.killsW1 = (db.global.killsW1 || 0) + 1;
            if (worldId === 2) db.global.killsW2 = (db.global.killsW2 || 0) + 1;
            writeDb(db);
            return db.global;
        }
    };

    global.DMDB = DMDB;
})(typeof window !== 'undefined' ? window : globalThis);
