const TURBOPUFFER_API_KEY = "tpuf_BEq2MmLReHCvmz6o4GcVQPcH0ZHZCfA7";
const NAMESPACE = "alchemy-combinations";

async function clearNamespace() {
  console.log(`Clearing Turbopuffer namespace: ${NAMESPACE}...`);
  const response = await fetch(`https://api.turbopuffer.com/v1/vectors/${NAMESPACE}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${TURBOPUFFER_API_KEY}`,
    },
  });

  if (response.ok) {
    console.log('Successfully cleared namespace!');
  } else {
    console.error('Failed to clear namespace:', await response.text());
  }
}

clearNamespace();
