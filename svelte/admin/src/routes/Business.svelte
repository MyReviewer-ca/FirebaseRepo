<script>
  export let params = {};
  import {addDoc, collection, doc, getDoc, getDocs, query, setDoc, where} from 'firebase/firestore';
  import {onMount} from 'svelte';

  let data = {};
  let links_list = [];

  onMount(async () => {
    //get the business id from the params
    const businessId = params.id;
    const business = await getDoc(doc(window.db, 'businesses', businessId));
    var d = business.data();
    data = {
      name: d.name || '',
      business_id: business.id || '123',
      registered_on: d.registered_on.toDate().toLocaleDateString() || '',
      contact_email: d.contact_email || '',
      contact_phone: d.contact_phone || '',
      hubspot_company_id: d.hubspot_company_id || '',
      stripe_customer_id: d.stripe_customer_id || '',
      stripe_subscription_id: d.stripe_subscription_id || '',
      logo_url: d.logo_url || '',
      redirect_url: d.redirect_url || '',
    };
    console.log(data);
    getLinks();
  });

  async function handleEdit(key) {
    console.log(`Editing ${key}`);

    //use prompt to get the new value
    const newValue = prompt(`Enter new value for ${key}`);

    await setDoc(
      doc(window.db, 'businesses', params.id),
      {
        [key]: newValue,
      },
      {merge: true}
    );
  }

  async function createLink() {
    const name = prompt('Enter link name');
    const type = prompt('Enter link type (qr, nfc, other)');
    if (type == 'qr' || type == 'nfc' || type == 'other') {
      if (name) {
        const docRef = await addDoc(collection(window.db, 'links'), {
          name,
          business_id: params.id,
          type,
          created_on: new Date(),
        }).then((docRef) => {
          alert('Link created');
        });
      }
    } else {
      alert('Invalid type');
    }
  }

  async function getLinks() {
    //get docs in links collection where business_id is params.id
    const links = collection(window.db, 'links');
    const q = query(links, where('business_id', '==', params.id));
    const linksSnapshot = await getDocs(q);
    links_list = linksSnapshot.docs.map((doc) => {
      return {id: doc.id, ...doc.data()};
    });
    return links_list;
  }
  let activeTab = 'about';
</script>

<div class="container">
  <button class="btn btn-secondary" on:click={window.spa.pop}>Back</button>

  <h1>Business</h1>
  <button class="btn btn-primary" on:click={createLink}>Create Link</button>

  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a class="nav-link" class:active={activeTab === 'about'} on:click={() => (activeTab = 'about')}>About</a>
    </li>

    <li class="nav-item">
      <a class="nav-link" class:active={activeTab === 'emails'} on:click={() => (activeTab = 'emails')}>Emails</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" class:active={activeTab === 'links'} on:click={() => (activeTab = 'links')}>Links</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" class:active={activeTab === 'reviews'} on:click={() => (activeTab = 'reviews')}>Reviews</a>
    </li>
  </ul>

  {#if activeTab === 'about'}
    <!-- About tab content -->
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Attribute</th>
          <th scope="col">Value</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries(data) as [key, value] (key)}
          <tr>
            <td>{key}</td>
            <td>{value}</td>
            {#if key != 'business_id' && key != 'registered_on'}
              <td>
                <button class="btn btn-primary" on:click={() => handleEdit(key)}>Edit</button>
              </td>
            {:else}
              <td></td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  {#if activeTab === 'emails'}
    <!-- Emails tab content -->
  {/if}

  {#if activeTab === 'links'}
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Type</th>
          <th scope="col">Total Clicks</th>
          <th scope="col">Total Collected Reviews</th>
          <th scope="col">Total Redirected</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each links_list as link (link.id)}
          <tr>
            <td>{link.name}</td>
            <td>{link.type}</td>
            <td>{link.total_clicks || 0}</td>
            <td>{link.total_collected_reviews || 0}</td>
            <td>{link.total_redirected || 0}</td>
            <td>
              <button
                class="btn btn-primary"
                on:click={() => {
                  alert('coming soon');
                }}>View</button
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  {#if activeTab === 'reviews'}
    <!-- Emails tab content -->
  {/if}
</div>
