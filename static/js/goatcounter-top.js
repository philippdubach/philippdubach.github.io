async function fetchTopPost() {
  const container = document.getElementById('top-post-week');
  
  try {
    const response = await fetch('https://weekly-top-goatcounter-api.philippd.workers.dev');
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    const data = await response.json();
    
    console.log('GoatCounter data:', data); // Debug log
    
    if (data.hits && data.hits.length > 0) {
      const topPost = data.hits[0];
      
      // Extract title - remove the site name suffix
      let title = topPost.title.replace(' - philippdubach.com', '');
      
      container.innerHTML = `Most read: <a href="${topPost.path}">${title}</a>`;
    } else {
      console.log('No hits found');
      container.remove();
    }
  } catch (error) {
    console.error('Could not load top post:', error);
    container.remove();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchTopPost);
} else {
  fetchTopPost();
}