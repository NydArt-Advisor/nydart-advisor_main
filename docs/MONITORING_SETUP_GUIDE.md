# 📊 NydArt Advisor - Monitoring & Alerting Setup Guide

## 🎯 **Overview**

This guide covers the complete monitoring and alerting system for NydArt Advisor, including:

- **Real-time Service Monitoring Dashboard**
- **Visual Service Status Cards**
- **Alerts and Notifications System**
- **Performance Metrics Integration**
- **Metrics Service Integration**

## 🏗️ **Architecture**

### **Components:**

1. **Frontend Monitoring Dashboard** (`/monitoring`)
   - Service status cards
   - Real-time health monitoring
   - Alerts panel
   - Performance metrics charts

2. **Metrics Service Integration**
   - Health checks
   - Performance data
   - Alert management
   - Uptime statistics

3. **Service Health Endpoints**
   - `/api/health` for each service
   - Response time monitoring
   - Version information
   - Uptime tracking

## 🚀 **Features**

### **✅ Service Status Monitoring**
- Real-time health checks for all 7 microservices
- Visual status indicators (green/yellow/red)
- Service icons and detailed information
- Auto-refresh every 30 seconds

### **✅ Alerts & Notifications**
- Real-time alert display
- Alert categorization (error/warning/info)
- Dismissible alerts
- Alert history

### **✅ Performance Metrics**
- Response time tracking
- System uptime percentage
- Service-specific metrics
- Visual performance charts

### **✅ Integration with Metrics Service**
- Comprehensive data from metrics service
- Fallback to direct health checks
- Real-time data synchronization
- Historical metrics

## 📁 **File Structure**

```
front/src/
├── components/monitoring/
│   ├── MonitoringDashboard.jsx    # Main dashboard component
│   ├── ServiceStatusCard.jsx      # Individual service status card
│   ├── AlertsPanel.jsx           # Alerts and notifications panel
│   └── MetricsChart.jsx          # Performance metrics visualization
├── services/
│   └── monitoringService.js      # Integration with metrics service
└── app/monitoring/
    └── page.jsx                  # Monitoring page route
```

## 🔧 **Setup Instructions**

### **1. Frontend Setup**

The monitoring dashboard is already integrated into your frontend. To access it:

1. **Navigate to the monitoring page:**
   ```
   http://localhost:3000/monitoring
   ```

2. **Add to navigation:**
   - The monitoring link is already added to the header navigation
   - Accessible via "Monitoring" in the main menu

### **2. Service Health Endpoints**

Ensure each service has a health endpoint:

#### **Auth Service** (`http://localhost:5002/api/health`)
```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "1.0.0",
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Database Service** (`http://localhost:5001/api/health`)
```json
{
  "status": "healthy",
  "service": "db-service",
  "version": "1.0.0",
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **AI Service** (`http://localhost:5003/api/health`)
```json
{
  "status": "healthy",
  "service": "ai-service",
  "version": "1.0.0",
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Payment Service** (`http://localhost:5004/api/health`)
```json
{
  "status": "healthy",
  "service": "payment-service",
  "version": "1.0.0",
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Notification Service** (`http://localhost:5005/api/health`)
```json
{
  "status": "healthy",
  "service": "notification-service",
  "version": "1.0.0",
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Metrics Service** (`http://localhost:5006/api/health`)
```json
{
  "status": "healthy",
  "service": "metrics-service",
  "version": "1.0.0",
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Frontend** (`http://localhost:3000/api/health`)
```json
{
  "status": "healthy",
  "service": "frontend",
  "version": "1.0.0",
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **3. Metrics Service Integration**

The monitoring dashboard automatically integrates with your metrics service:

#### **Environment Variables**
Add to your frontend `.env.local`:
```env
NEXT_PUBLIC_METRICS_SERVICE_URL=http://localhost:5006
```

#### **Metrics Service Endpoints**
Your metrics service should provide these endpoints:

- `GET /api/health/services` - Get health status for all services
- `GET /api/metrics/service/{serviceName}` - Get service-specific metrics
- `GET /api/metrics/system` - Get system-wide metrics
- `GET /api/alerts` - Get alerts and notifications
- `POST /api/alerts/{id}/acknowledge` - Acknowledge an alert
- `GET /api/uptime` - Get uptime statistics
- `GET /api/metrics/errors` - Get error rates

## 🎨 **UI Features**

### **Service Status Cards**
- **Visual Design**: Clean, modern cards with service icons
- **Status Indicators**: Color-coded health status (green/yellow/red)
- **Service Information**: Port, version, uptime, response time
- **Alert Display**: Shows active alerts for each service

### **Alerts Panel**
- **Real-time Updates**: Live alert feed
- **Categorization**: Error, warning, and info alerts
- **Dismissible**: Users can dismiss individual alerts
- **Timestamp**: Shows when alerts occurred

### **Performance Metrics**
- **Summary Cards**: System uptime, healthy services, response times
- **Response Time Charts**: Visual representation of service performance
- **Status Overview**: Quick view of all service statuses

## 🔄 **Auto-Refresh & Real-time Updates**

### **Automatic Refresh**
- Dashboard refreshes every 30 seconds
- Manual refresh button available
- Real-time status updates

### **Metrics Service Integration**
- Primary data source: Metrics service
- Fallback: Direct health checks
- Seamless switching between data sources

## 📊 **Monitoring Data**

### **Service Health Data**
```javascript
{
  name: 'auth-service',
  port: 5002,
  status: 'healthy', // 'healthy', 'warning', 'error', 'loading'
  responseTime: '45ms',
  uptime: '2h 15m 30s',
  version: '1.0.0',
  lastCheck: '2024-01-15T10:30:00Z',
  alerts: []
}
```

### **Alert Data**
```javascript
{
  id: 'alert-123',
  service: 'auth-service',
  type: 'error', // 'error', 'warning', 'info'
  message: 'Service unavailable',
  timestamp: '2024-01-15T10:30:00Z'
}
```

## 🚨 **Alert Types**

### **Error Alerts**
- Service down
- Connection failures
- Critical errors

### **Warning Alerts**
- High response times
- Resource usage warnings
- Performance degradation

### **Info Alerts**
- Service restarts
- Configuration changes
- Maintenance notifications

## 🎯 **Usage Instructions**

### **Accessing the Dashboard**
1. Start your frontend application
2. Navigate to `http://localhost:3000/monitoring`
3. View real-time service status

### **Interacting with Alerts**
1. View alerts in the right sidebar
2. Click the "X" to dismiss individual alerts
3. Use "Dismiss all" to clear all alerts
4. Toggle alerts panel visibility

### **Refreshing Data**
1. Click the "Refresh" button for manual updates
2. Data automatically refreshes every 30 seconds
3. Last updated time is displayed

## 🔧 **Customization**

### **Adding New Services**
1. Update `serviceConfig` in `MonitoringDashboard.jsx`
2. Add service icon in `ServiceStatusCard.jsx`
3. Ensure service has `/api/health` endpoint

### **Modifying Alert Types**
1. Update alert categorization in `AlertsPanel.jsx`
2. Modify alert colors and icons
3. Add new alert types as needed

### **Custom Metrics**
1. Extend `monitoringService.js` with new endpoints
2. Add new metrics to `MetricsChart.jsx`
3. Update dashboard to display new data

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Services Not Showing**
- Check if services are running
- Verify health endpoints are accessible
- Check network connectivity

#### **Metrics Service Not Available**
- Dashboard falls back to direct health checks
- Check metrics service logs
- Verify environment variables

#### **Alerts Not Displaying**
- Check alert data format
- Verify timestamp format
- Check console for errors

### **Debug Mode**
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('monitoring-debug', 'true');
```

## 📈 **Performance Considerations**

### **Optimization**
- Health checks timeout after 5 seconds
- Parallel requests for multiple services
- Efficient data transformation
- Minimal re-renders

### **Scalability**
- Dashboard handles 7+ services efficiently
- Alert system scales with service count
- Metrics integration supports high-frequency updates

## 🔒 **Security**

### **Access Control**
- Monitoring dashboard accessible to authenticated users
- Health endpoints should be protected
- Metrics service requires proper authentication

### **Data Protection**
- No sensitive data in health responses
- Alert messages should not contain secrets
- Secure communication with metrics service

## 🎉 **Next Steps**

1. **Start all services** and verify health endpoints
2. **Access the monitoring dashboard** at `/monitoring`
3. **Test alert scenarios** by stopping services
4. **Customize the dashboard** as needed
5. **Integrate with your metrics service** for enhanced data

Your monitoring system is now ready to provide real-time visibility into your NydArt Advisor microservices! 🚀

