
/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add fallbacks for Node.js core modules that are not available in the browser
      // This is crucial for libraries like the mongodb driver that might have optional
      // dependencies or code paths for Node.js environments.
      config.resolve.fallback = {
        ...config.resolve.fallback, // Spread existing fallbacks
        "child_process": false,     // For mongocryptd_manager.js in mongodb driver
        "fs": false,                // Common Node.js module
        "net": false,               // Common Node.js module
        "dns": false,               // Common Node.js module
        "tls": false,               // Common Node.js module
        "timers/promises": false,   // For mongodb_oidc/automated_callback_workflow.js
        
        // These are often optional or native dependencies of the mongodb driver.
        // Setting them to false prevents Webpack from trying to bundle them for the client.
        "mongodb-client-encryption": false, 
        "aws4": false, 
        "kerberos": false, 
        "saslprep": false,
        "@mongodb-js/zstd": false,
        "snappy": false,
        "bson-ext": false, 
      };
    }
    
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
