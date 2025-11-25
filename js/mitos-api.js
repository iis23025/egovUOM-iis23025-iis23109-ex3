const MITOS_API_BASE = 'https://api.digigov.grnet.gr/v1';
// const MITOS_API_KEY = 'MITOS-API-KEY';

async function fetchMitosService(serviceId) {
  const url = `${MITOS_API_BASE}/services/${serviceId}`;

  const response = await fetch(url, {
    // Αν χρειαστούμε μελλοντικά το API key που μας δίνεται μέσω επικοινωνίας με email με το mitos:
    
    // headers: {
    //   'Accept': 'application/json',
    //   'X-Api-Key': MITOS_API_KEY
    // }
  });

  if (!response.ok) {
    throw new Error(`MITOS API error ${response.status}`);
  }

  const json = await response.json();
  const data = json.data; 

  window.currentMitosService = data;

  try {
    localStorage.setItem(
      `mitos-service-${serviceId}`,
      JSON.stringify(data)
    );
  } catch (e) {
    console.warn('Unable to write to localStorage', e);
  }

  return data;
}