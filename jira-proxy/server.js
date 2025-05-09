const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/jira-proxy', async (req, res) => {
  const { jiraBaseUrl, jiraEmail, jiraApiToken, endpoint, jql, maxResults, fields } = req.body;
  if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const apiEndpoint = endpoint || '/rest/api/3/myself';
  
  try {
    let url = `${jiraBaseUrl}${apiEndpoint}`;
    const options = {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64'),
        'Accept': 'application/json',
      },
    };

    // Handle search endpoint with JQL query
    if (apiEndpoint === '/rest/api/3/search') {
      const params = new URLSearchParams();
      if (jql) params.append('jql', jql);
      if (maxResults) params.append('maxResults', maxResults);
      if (fields) params.append('fields', fields.join(','));
      url += '?' + params.toString();
    }

    console.log('Jira API Request:', {
      url,
      jql,
      maxResults,
      fields
    });

    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log('Jira API Response:', {
      status: response.status,
      total: data.total,
      issues: data.issues?.length
    });

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Jira Proxy Error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Jira proxy running on port ${PORT}`)); 