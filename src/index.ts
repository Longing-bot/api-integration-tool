#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ApiClient } from './api-client';
import { ConfigManager } from './config-manager';
import { ResponseFormatter } from './response-formatter';

const program = new Command();

program
  .name('api-tool')
  .description('Universal API integration and management tool')
  .version('1.0.0');

// Configuration commands
program
  .command('configure')
  .description('Configure API endpoints and authentication')
  .option('-e, --endpoint <url>', 'API endpoint URL')
  .option('-a, --auth <token>', 'Authentication token')
  .action(async (options) => {
    const config = new ConfigManager();
    
    if (options.endpoint) {
      config.setEndpoint(options.endpoint);
      console.log(chalk.green(`✅ Endpoint configured: ${options.endpoint}`));
    }
    
    if (options.auth) {
      config.setAuthToken(options.auth);
      console.log(chalk.green('✅ Authentication token configured'));
    }

    console.log(chalk.blue('📋 Current configuration:'));
    console.log(config.getAll());
  });

// API testing commands
program
  .command('test')
  .description('Test API endpoints')
  .requiredOption('-m, --method <method>', 'HTTP method (GET, POST, PUT, DELETE)')
  .requiredOption('-u, --url <url>', 'API endpoint URL')
  .option('-d, --data <json>', 'Request data as JSON string')
  .option('-h, --headers <json>', 'Custom headers as JSON string')
  .action(async (options) => {
    console.log(chalk.cyan(`🧪 Testing ${options.method} ${options.url}`));

    try {
      const client = new ApiClient();
      const response = await client.request({
        method: options.method,
        url: options.url,
        data: options.data ? JSON.parse(options.data) : undefined,
        headers: options.headers ? JSON.parse(options.headers) : {}
      });

      const formatter = new ResponseFormatter();
      console.log(formatter.format(response));
      
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('❌ Test failed:'), error.message);
      process.exit(1);
    }
  });

// Batch operations
program
  .command('batch')
  .description('Execute batch API operations')
  .requiredOption('-f, --file <path>', 'JSON file with batch operations')
  .option('--parallel', 'Run operations in parallel', false)
  .action(async (options) => {
    console.log(chalk.cyan(`📦 Executing batch operations from ${options.file}`));

    try {
      const fs = await import('fs');
      const data = JSON.parse(fs.readFileSync(options.file, 'utf8'));

      const client = new ApiClient();
      const results = await client.batchExecute(data, options.parallel);

      const formatter = new ResponseFormatter();
      console.log(chalk.green(`✅ Batch completed: ${results.successful}/${results.total} successful`));
      console.log(formatter.format(results));
      
    } catch (error) {
      console.error(chalk.red('❌ Batch execution failed:'), error.message);
      process.exit(1);
    }
  });

// Health check command
program
  .command('health')
  .description('Check API health and connectivity')
  .option('--timeout <ms>', 'Timeout in milliseconds', '5000')
  .action(async (options) => {
    console.log(chalk.cyan('🏥 Checking API health...'));

    const client = new ApiClient();
    try {
      const health = await client.checkHealth(options.timeout);
      const formatter = new ResponseFormatter();
      console.log(chalk.green('✅ Health check passed:'), formatter.format(health));
    } catch (error) {
      console.error(chalk.red('❌ Health check failed:'), error.message);
      process.exit(1);
    }
  });

// Schema validation command
program
  .command('validate')
  .description('Validate API responses against schemas')
  .requiredOption('-s, --schema <path>', 'JSON schema file path')
  .requiredOption('-r, --response <path>', 'Response data file path')
  .action(async (options) => {
    console.log(chalk.cyan(`🔍 Validating response against schema`));

    try {
      const fs = await import('fs');
      
      const schema = JSON.parse(fs.readFileSync(options.schema, 'utf8'));
      const response = JSON.parse(fs.readFileSync(options.response, 'utf8'));

      const validator = await import('json-schema').then(m => m.validate);
      const result = validator(response, schema);

      if (result.valid) {
        console.log(chalk.green('✅ Validation passed'));
      } else {
        console.error(chalk.red('❌ Validation failed:'));
        result.errors.forEach(error => {
          console.error(`   - ${error}`);
        });
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Validation error:'), error.message);
      process.exit(1);
    }
  });

// Generate documentation command
program
  .command('generate-docs')
  .description('Generate API documentation from OpenAPI specs')
  .requiredOption('-i, --input <path>', 'OpenAPI spec file path')
  .option('--format <format>', 'Output format (markdown, html, json)', 'markdown')
  .action(async (options) => {
    console.log(chalk.cyan(`📚 Generating documentation from ${options.input}`));

    try {
      const fs = await import('fs');
      const spec = JSON.parse(fs.readFileSync(options.input, 'utf8'));
      
      // Basic documentation generation logic
      const docs = {
        title: spec.info?.title || 'API Documentation',
        version: spec.info?.version || '1.0.0',
        paths: Object.keys(spec.paths || {}).length,
        methods: new Set(
          Object.values(spec.paths || {})
            .flatMap(path => Object.keys(path || {}))
            .filter(key => !key.startsWith('{'))
        ).size
      };

      if (options.format === 'json') {
        console.log(JSON.stringify(docs, null, 2));
      } else {
        console.log(chalk.blue(`# ${docs.title} v${docs.version}`));
        console.log(`**Endpoints:** ${docs.paths}`);
        console.log(`**Methods:** ${docs.methods}`);
        console.log('\n## Available Endpoints');
        console.log(Object.keys(spec.paths || {}).join('\n'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Documentation generation failed:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

console.log(chalk.cyan(`
╭─────────────────────────────╮
│   API Integration Tool v1.0.0 │
│  🌐 Universal API Management  │
╰─────────────────────────────╯
`));