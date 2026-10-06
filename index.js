const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
let connection = null;

app.use(express.json());

async function getConnection() {
    //Singleton DB connection
    if (null === connection) {
        console.log('Here');
        connection = await mysql.createConnection({
            host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
            user: "NICHOLASRICHTER",
            password: "oOYELgwcZ2Rl5OzK9k6zQbQQYXEbLOBiOUL",
            database: 'NICHOLASRICHTER'
        });
    }

    return connection;
}

app.post("/api/sensor", async (req, res) => {
    console.log("Received sensor data:");

    console.log(JSON.stringify(req.body, null, 2));

    // Access the events
    const events = req.body.events;

    if (!events || !Array.isArray(events)) {
        return res.status(400).json({
            message: "Invalid sensor data"
        });
    }

    const validEvents = events.every((event) =>
        event &&
        Number.isInteger(event.x) &&
        Number.isInteger(event.y) &&
        Number.isInteger(event.duration_ms)
    );

    if (!validEvents) {
        return res.status(400).json({
            message: "Each event must include integer x, y, and duration_ms values"
        });
    }

    try {
        const db = await getConnection();

        for (const event of events) {
            await db.execute(
                `INSERT INTO joystick_tracker
                    (id, x_coordinates, y_coordinates, time_held)
                 SELECT COALESCE(MAX(id), 0) + 1, ?, ?, ?
                 FROM joystick_tracker`,
                [event.x, event.y, event.duration_ms]
            );

            console.log(
                `Saved X: ${event.x}, Y: ${event.y}, Duration: ${event.duration_ms} ms`
            );
        }
    } catch (error) {
        console.error("Failed to save sensor data:", error);
        return res.status(500).json({
            message: "Failed to save sensor data"
        });
    }

    res.json({
        message: "Sensor data received",
        eventCount: events.length
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
