import chalk from 'chalk';

export interface FormattedResponse {
  status: string;
  data: any;
  metadata?: Record<string, any>;
}

export class ResponseFormatter {
  format(response: any): string {
    if (typeof response === 'string') {
      return response;
    }

    if (response.status) {
      return this.formatDetailedResponse(response);
    }

    if (Array.isArray(response)) {
      return this.formatArrayResponse(response);
    }

    if (typeof response === 'object' && response !== null) {
      return this.formatObjectResponse(response);
    }

    return JSON.stringify(response, null, 2);
  }

  private formatDetailedResponse(response: any): string {
    let output = '';

    // Status line
    const statusColor = response.status === 'healthy' ? 'green' : 'red';
    output += chalk[statusColor](`Status: ${response.status.toUpperCase()}\n`);

    // Metadata
    if (response.metadata) {
      output += chalk.gray('Metadata:\n');
      for (const [key, value] of Object.entries(response.metadata)) {
        output += `  ${key}: ${value}\n`;
      }
      output += '\n';
    }

    // Data section
    if (response.data) {
      output += chalk.blue('Data:\n');
      try {
        output += JSON.stringify(response.data, null, 2);
      } catch (error) {
        output += String(response.data);
      }
    }

    // Error section (if present)
    if (response.error) {
      output += chalk.red('\nError:\n');
      output += response.error;
    }

    return output;
  }

  private formatArrayResponse(array: any[]): string {
    if (array.length === 0) {
      return chalk.yellow('Empty array');
    }

    let output = chalk.blue(`Array (${array.length} items):\n\n`);
    
    array.forEach((item, index) => {
      output += chalk.cyan(`${index + 1}. `);
      
      if (typeof item === 'object' && item !== null) {
        try {
          output += JSON.stringify(item, null, 4);
        } catch (error) {
          output += String(item);
        }
      } else {
        output += String(item);
      }
      
      output += '\n\n';
    });

    return output.trim();
  }

  private formatObjectResponse(obj: any): string {
    if (Object.keys(obj).length === 0) {
      return chalk.yellow('Empty object');
    }

    let output = chalk.blue('Object:\n\n');

    for (const [key, value] of Object.entries(obj)) {
      output += chalk.green(`${key}: `);
      
      if (typeof value === 'object' && value !== null) {
        try {
          const formatted = JSON.stringify(value, null, 2);
          output += chalk.white(formatted);
        } catch (error) {
          output += chalk.white(String(value));
        }
      } else {
        output += chalk.white(String(value));
      }
      
      output += '\n';
    }

    return output;
  }

  formatBatchResult(result: any): string {
    let output = chalk.cyan('📊 Batch Operation Results:\n\n');
    
    output += chalk.blue(`Total Operations: ${result.total}\n`);
    output += chalk.green(`Successful: ${result.successful}\n`);
    
    if (result.failed > 0) {
      output += chalk.red(`Failed: ${result.failed}\n`);
    }
    
    output += `Success Rate: ${((result.successful / result.total) * 100).toFixed(1)}%\n\n`;

    // Individual operation results
    result.results.forEach((op: any, index: number) => {
      const status = op.success ? '✅' : '❌';
      output += `${status} Operation ${index + 1}: ${op.id}\n`;
      
      if (op.success && op.data) {
        output += `   Response: ${JSON.stringify(op.data).substring(0, 100)}...\n`;
      } else if (!op.success && op.error) {
        output += `   Error: ${op.error}\n`;
      }
      
      output += '\n';
    });

    return output;
  }

  formatHealthCheck(health: any): string {
    let output = '';

    // Status indicator
    const statusIcon = health.status === 'healthy' ? '🟢' : '🔴';
    output += `${statusIcon} Health Status: ${health.status.toUpperCase()}\n\n`;

    // Response time
    if (health.responseTime) {
      const timeColor = health.responseTime < 1000 ? 'green' : 
                       health.responseTime < 3000 ? 'yellow' : 'red';
      output += `${chalk[timeColor](`⏱️ Response Time: ${health.responseTime}ms`)}\n`;
    }

    // Endpoint info
    if (health.endpoint) {
      output += `${chalk.blue(`🌐 Endpoint: ${health.endpoint}`)}\n`;
    }

    // Status code
    if (health.statusCode) {
      output += `${chalk.cyan(`📋 Status Code: ${health.statusCode}`)}\n`;
    }

    // Data preview
    if (health.data) {
      output += '\n' + chalk.yellow('📊 Response Preview:\n');
      const dataPreview = typeof health.data === 'string' ? health.data :
                         JSON.stringify(health.data).substring(0, 200);
      output += `${dataPreview}${health.data?.length > 200 ? '...' : ''}`;
    }

    if (health.error) {
      output += '\n' + chalk.red(`🚨 Error: ${health.error}`);
    }

    return output;
  }
}