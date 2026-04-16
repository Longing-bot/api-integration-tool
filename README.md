# 🌐 API Integration Tool

Universal API integration and management tool with multi-protocol support, comprehensive testing, and enterprise-grade features.

## ✨ Features

### **Core Capabilities**
- 🔗 **Multi-Protocol Support**: HTTP/HTTPS, REST, GraphQL-ready
- ⚡ **Batch Operations**: Execute multiple API calls efficiently
- 🔍 **Health Monitoring**: Real-time API health checks
- 📊 **Response Formatting**: Colorized, structured output
- 🔧 **Configuration Management**: Persistent API settings
- ✅ **Schema Validation**: Validate responses against JSON schemas
- 📚 **Documentation Generation**: Auto-generate docs from OpenAPI specs

### **Advanced Features**
- 🚀 **Parallel Execution**: Concurrent API operations
- 🔄 **Automatic Retry Logic**: Configurable retry policies
- 🛡️ **Error Handling**: Comprehensive error recovery
- 📈 **Performance Monitoring**: Request statistics and metrics
- 🎯 **Priority Queuing**: Control operation execution order

## 🚀 Quick Start

```bash
# Install globally
npm install -g api-integration-tool

# Or use locally
cd /path/to/project
npx api-tool --help

# Configure your first API
api-tool configure --endpoint https://api.example.com --auth YOUR_TOKEN

# Test an endpoint
api-tool test --method GET --url /users --headers '{"Accept": "application/json"}'

# Check API health
api-tool health --timeout 3000
```

## 📋 Commands

### Configuration
```bash
api-tool configure [options]
```
Set up API endpoints and authentication tokens persistently.

**Options:**
- `-e, --endpoint <url>` - API base URL
- `-a, --auth <token>` - Authentication token

### Testing
```bash
api-tool test [options]
```
Test individual API endpoints with custom requests.

**Required Options:**
- `-m, --method <method>` - HTTP method (GET, POST, PUT, DELETE)
- `-u, --url <url>` - API endpoint path

**Optional Options:**
- `-d, --data <json>` - Request body as JSON
- `-h, --headers <json>` - Custom headers as JSON

### Batch Operations
```bash
api-tool batch [options]
```
Execute multiple API operations in sequence or parallel.

**Required Options:**
- `-f, --file <path>` - JSON file with batch operations

**Optional Options:**
- `--parallel` - Run operations concurrently (default: sequential)

### Health Checks
```bash
api-tool health [options]
```
Monitor API availability and performance.

**Optional Options:**
- `--timeout <ms>` - Response timeout (default: 5000ms)

### Schema Validation
```bash
api-tool validate [options]
```
Validate API responses against JSON schemas.

**Required Options:**
- `-s, --schema <path>` - JSON schema file
- `-r, --response <path>` - Response data file

### Documentation Generation
```bash
api-tool generate-docs [options]
```
Generate documentation from OpenAPI specifications.

**Required Options:**
- `-i, --input <path>` - OpenAPI spec file path

**Optional Options:**
- `--format <format>` - Output format (markdown, html, json)

## 📁 Project Structure

```
api-integration-tool/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── api-client.ts         # HTTP client implementation
│   ├── config-manager.ts     # Configuration persistence
│   └── response-formatter.ts # Output formatting
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest test configuration
└── README.md                # This file
```

## 🧪 Example Usage

### Basic API Testing
```bash
# Test a simple GET request
api-tool test -m GET -u /api/users

# Test with authentication
api-tool test -m POST -u /api/login -d '{"username":"user","password":"pass"}' -h '{"Content-Type":"application/json"}'
```

### Batch Operations
Create a `batch-operations.json` file:
```json
[
  {
    "id": "get-users",
    "method": "GET",
    "url": "/api/users"
  },
  {
    "id": "create-user", 
    "method": "POST",
    "url": "/api/users",
    "data": {"name": "John Doe", "email": "john@example.com"}
  }
]
```

Then execute:
```bash
api-tool batch -f batch-operations.json --parallel
```

### Health Monitoring
```bash
# Check all configured APIs
api-tool health --timeout 10000

# Monitor specific endpoint
api-tool health --endpoint https://api.service.com/health
```

## 🔧 Development

### Setup
```bash
npm install
npm run build
```

### Testing
```bash
npm test                    # Run tests with coverage
npm run test:watch          # Watch mode for development
```

### Building
```bash
npm run build              # Compile TypeScript to JavaScript
npm start                  # Run compiled version
```

## 🛠️ Architecture

### **Modular Design**
- **ApiClient**: Handles HTTP requests and responses
- **ConfigManager**: Manages persistent configuration
- **ResponseFormatter**: Formats and colors output
- **CLI Interface**: Commander.js-based command structure

### **Type Safety**
- Full TypeScript implementation
- Strict type checking enabled
- Comprehensive interface definitions
- Null safety throughout

### **Error Handling**
- Graceful degradation on network failures
- Detailed error messages with context
- Automatic retry mechanisms
- Structured logging with Winston

## 📊 Performance Features

- **Concurrent Processing**: Parallel API calls for better throughput
- **Connection Pooling**: Reuse HTTP connections for efficiency
- **Request Caching**: Optional caching layer for repeated requests
- **Memory Management**: Efficient handling of large responses

## 🔒 Security Considerations

- **Secure Storage**: Configuration stored locally with proper permissions
- **Token Management**: Secure handling of authentication credentials
- **Input Validation**: All user inputs validated before processing
- **Error Sanitization**: Sensitive information not exposed in error messages

## 🚀 Future Enhancements

- **GraphQL Support**: Native GraphQL query execution
- **WebSocket Monitoring**: Real-time connection monitoring
- **Rate Limiting**: Built-in rate limit handling
- **Circuit Breaker**: Failure detection and recovery patterns
- **Plugin System**: Extensible architecture for custom protocols

## 🤝 Contributing

This is a foundational project demonstrating modern Node.js development practices. Contributions welcome!

## 📄 License

MIT License - see LICENSE file for details.