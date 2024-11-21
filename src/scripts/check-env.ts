/* eslint-disable prettier/prettier */
function checkEnvironment() {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NODE_ENV',
      'PORT',
      'RATE_LIMIT_MAX',
      'CORS_ENABLED',
      'CORS_ORIGIN'
    ];
  
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars);
      process.exit(1);
    }
  
    console.log('All required environment variables are present');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Database URL exists:', !!process.env.DATABASE_URL);
  }
  
  checkEnvironment();
  