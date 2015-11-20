var config;

config = {
  server: {
    host: '0.0.0.0',
    port: 3000,
    ssl: {
      enabled: false,
      host: '127.0.0.1',
      port: 9443,
      spdy: false,
      // Exclusive redirects all http request to the https server
      exclusive: false,
      // not used
      //key: '/config/keys/myssl.key',
      //cert: '/config/keys/myssl.cert',
      //ca: ['/config/keys/myssl.cabundle'],
      maxstreams: 50
    }
  },
  molecuel: {
    database: {
      type: 'mongodb',
      uri: 'mongodb://192.168.99.1/mlcl_minimal',
      debug: true,
      cache: {
        max:50,
        maxAge:1000*60*60,
        debug: false
      }
    },
    queue: {
      uri: 'amqp://molecuel:molecuel@192.168.99.100/molecuel'
    },
    search: {
      hosts: ['http://192.168.99.1:9200'],
      prefix: 'mlcl_minimal'
    },
    log: {
      ttl: '1h',
      overwriteConsole: false,
      pathdebug: true
    },
    user: {
      roles: ['admin', 'editor', 'chiefEditor', 'usermanager'],
      secret: 'PLEASE_CHANGE_THIS',
      session_expiration: 3000000,
      permissions: {
        'authenticated': ['apiAccess'],
        'admin': ['viewAdminMenu', 'apiAccess'],
        'editor': ['viewAdminMenu', 'apiAccess'],
        'chiefEditor': ['viewAdminMenu', 'apiAccess']
      }
    },
    theme: {
    },
    modules: {
      mlcl_i18n: {name: 'i18n', enabled: true},
      mlcl_log: {name: 'log', enabled: true},
      mlcl_user: {name: 'user', enabled: true},
      mlcl_database: { name: 'database', enabled: true },
      mlcl_elastic: { name: 'elastic', enabled: true },
      mlcl_url: { name: 'url', enabled: true},
      mlcl_elements: { name: 'elements', enabled: true},
      mlcl_collections: {name: 'collections', enabled: true},
      mlcl_queue: {name: 'queue', enabled: true}
    },
    i18n: {
      detectLngFromPath: true,
      debug: false,
      languages: {
        en: {
          name: 'English',
          prefix: null,
          default: true
        },
        de: {
          name: 'German',
          prefix: 'de'
        }
      }
    },
    elements: {
      schemaDir: __dirname + '/models'
    },
    collections: {
      collectionDir: __dirname + '/collections'
    },
    image: {
      configDir: __dirname + '/imagestyles'
    },
    collections: {
      collectionDir: __dirname + '/collections'
    },
    routes: [
      {
        url: '/login/jwt',
        // allow crossdomain access
        crossdomain: true
      },
      {
        module: 'user',
        middleware: true
      },
      {
        url: '/api/*',
        get: true,
        post: true,
        delete: true,
        //permission: 'apiAccess',
        crossdomain: true
      },
      {
        url: '/api/elements/sync',
        get: true,
        callbacks: [{
          module: 'elements',
          function: 'syncMiddleware'
        }]
      }
    ]
  }
}

module.exports = config;
