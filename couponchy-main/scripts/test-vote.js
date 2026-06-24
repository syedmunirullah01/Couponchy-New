async function test() {
  const url = 'http://localhost:3000/api/offers/d8c4c51d-68c5-43e6-9792-bb55aef0c9a5/feedback';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100' // mock IP to avoid localhost collision if needed
      },
      body: JSON.stringify({ voteType: 'success' })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
