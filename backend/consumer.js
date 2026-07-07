require('dotenv').config();
const { Kafka } = require('kafkajs');
const log4js = require('log4js');

log4js.configure({
    appenders: { 
        console: { 
            type: 'console', 
            layout: { type: 'pattern', pattern: '%m' } 
        } 
    },
    categories: { default: { appenders: ['console'], level: 'info' } }
});
const logger = log4js.getLogger('CDC-Consumer');

const kafka = new Kafka({
    clientId: 'cdc-consumer',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'cdc-log-group' });

async function run() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'dbserver1.app_db.users', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value) return;
            const event = JSON.parse(message.value.toString());
            
            const op = event.payload.op;
            const opMap = { c: 'INSERT', u: 'UPDATE', d: 'DELETE' };

            logger.info(JSON.stringify({
                timestamp: new Date().toISOString(),
                action: 'DB_CHANGE',
                operation: opMap[op] || op,
                data: op === 'd' ? event.payload.before : event.payload.after
            }));
        },
    });
}

run().catch(console.error);