
A full-stack containerized application with a React frontend, an Express.js REST API with JWT authentication, a MySQL database configured for Change Data Capture, and an Apache Kafka event streaming pipeline processed by a real-time Node.js consumer.
## Architecture Overview

* **Frontend:** React (Vite)
* **Backend:** Node.js & Express.js with `log4js` structured JSON auditing
* **Database:** MySQL 8.0 with Binary Logging enabled (`--log-bin`)
* **CDC & Message Broker:** Debezium Connect & Apache Kafka (with Zookeeper)
* **Real-Time Consumer:** Node.js standalone worker using `kafkajs`

## Project Structure

```text
Sre-HomeAssignment/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── consumer.js
│   ├── package.json
│   └── server.js 
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   └── package.json
├── docker-compose.yml
└── README.md
