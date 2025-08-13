const fs = require('fs');
const path = require('path');

console.log('🔍 Agendoo Backend - Diagnóstico');
console.log('================================');

// 1. Verificar que existe .env
const envPath = path.join(__dirname, '../', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado');
  
  // Leer variables principales
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      console.log(`✅ ${varName} configurado`);
    } else {
      console.log(`❌ ${varName} faltante`);
    }
  });
} else {
  console.log('❌ Archivo .env no encontrado');
  console.log('   Ejecuta: cp .env.example .env');
}

// 2. Verificar archivos principales
const requiredFiles = [
  'src/main.ts',
  'src/app.module.ts',
  'src/auth/auth.module.ts',
  'src/users/users.module.ts',
  'src/barbers/barbers.module.ts',
  'src/bookings/bookings.module.ts'
];

console.log('\n📁 Verificando archivos principales:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// 3. Verificar package.json
console.log('\n📦 Verificando dependencias:');
const packagePath = path.join(__dirname, '../', 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const requiredDeps = [
    '@nestjs/common',
    '@nestjs/core', 
    '@apollo/server',
    '@nestjs/graphql',
    '@nestjs/typeorm',
    'typeorm',
    'pg'
  ];
  
  requiredDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      console.log(`✅ ${dep} v${pkg.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} no instalado`);
    }
  });
} else {
  console.log('❌ package.json no encontrado');
}

// 4. Verificar node_modules
console.log('\n📚 Verificando instalación:');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules existe');
  if (fs.existsSync('yarn.lock')) {
    console.log('✅ yarn.lock encontrado');
  } else if (fs.existsSync('package-lock.json')) {
    console.log('✅ package-lock.json encontrado');
  }
} else {
  console.log('❌ node_modules no existe');
  console.log('   Ejecuta: yarn install');
}

console.log('\n🏁 Diagnóstico completado');
