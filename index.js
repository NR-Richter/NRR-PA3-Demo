const express = require("express");

const app = express();

app.use(express.json());

app.post("/api/sensor", (req, res) => {
    console.log("Received sensor data:");

    console.log(JSON.stringify(req.body, null, 2));

    // Access the events
    const events = req.body.events;

    if (!events || !Array.isArray(events)) {
        return res.status(400).json({
            message: "Invalid sensor data"
        });
    }

    // Process each joystick event
    events.forEach((event) => {
        console.log(
            `X: ${event.x}, Y: ${event.y}, Duration: ${event.duration_ms} ms`
        );
    });

    res.json({
        message: "Sensor data received",
        eventCount: events.length
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
