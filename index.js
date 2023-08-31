const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware to read JSON files
const readJSONFile = (filename) => {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
};

app.get('/v1/structure', (req, res) => {
    const { projectId, locationType } = req.query;
    if (locationType === 'building') {
        const buildings = readJSONFile('./buildings.json').buildings;
        const building = buildings.find(b => b.id === projectId);
        if (building) {
            return res.json(building);
        }
        return res.status(404).json({ error: 'Building not found' });
    }
    res.status(400).json({ error: 'Invalid location type' });
});

app.get('/v2/Checklists', (req, res) => {
    const { projectId } = req.query;
    const checklists = readJSONFile('./checklists.json').checklists;
    const checklist = checklists.find(c => c.id === projectId);
    if (checklist) {
        return res.json(checklist);
    }
    return res.status(404).json({ error: 'Checklist not found' });
});

app.get('/v1/project/:projectId', (req, res) => {
    const fields = req.query.fields ? JSON.parse(req.query.fields) : [];
    if (fields.includes('members')) {
        const members = readJSONFile('./members.json').members;
        const member = members.find(m => m.id === req.params.projectId);
        if (member) {
            return res.json(member);
        }
        return res.status(404).json({ error: 'Member not found' });
    }
    res.status(400).json({ error: 'Invalid field' });
});

app.get('/v1/configurations', (req, res) => {
    const { projectId } = req.query;
    const configurations = readJSONFile('./configurations.json').configurations;
    // Assuming configurations are structured by projectId
    const config = configurations[projectId];
    if (config) {
        return res.json(config);
    }
    return res.status(404).json({ error: 'Configuration not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
