<script>
  import {addDoc, collection, getDocs, limit, query, where} from 'firebase/firestore';
  import {onMount} from 'svelte';

  let businessesList = [];
  let links_list = [];

  onMount(async () => {
    const businesses = collection(window.db, 'businesses');
    const businessesSnapshot = await getDocs(businesses);
    businessesList = businessesSnapshot.docs.map((doc) => {
      return {id: doc.id, ...doc.data()};
    });
    getLinks();
  });

  function navigateToBusiness(id) {
    window.spa.push(`/b/${id}`);
  }

  async function createBusiness() {
    const name = prompt('Enter business name');
    if (name) {
      const docRef = await addDoc(collection(window.db, 'businesses'), {
        name,
        registered_on: new Date(),
      });
    }
  }
  async function createLink() {
    const name = prompt('Enter link name');
    const type = prompt('Enter link type (qr, nfc, other)');
    if (type == 'qr' || type == 'nfc' || type == 'other') {
      if (name) {
        const docRef = await addDoc(collection(window.db, 'links'), {
          name,
          business_id: '',
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
    const q = query(links, where('business_id', '==', ''), limit(100));
    const linksSnapshot = await getDocs(q);
    links_list = linksSnapshot.docs.map((doc) => {
      return {id: doc.id, ...doc.data()};
    });
    return links_list;
  }
  var activeTab = 'businesses';
</script>

<div class="container">
  <h1>Dashboard</h1>

  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a class="nav-link" class:active={activeTab === 'businesses'} on:click={() => (activeTab = 'businesses')}>Businesses</a>
    </li>

    <li class="nav-item">
      <a class="nav-link" class:active={activeTab === 'links'} on:click={() => (activeTab = 'links')}>Blank Links</a>
    </li>
  </ul>

  {#if activeTab === 'businesses'}
    <button class="btn btn-primary" on:click={createBusiness}>Create Business</button>

    <!-- About tab content -->
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each businessesList as business (business.id)}
          <tr>
            <td>{business.name}</td>
            <td>
              <button class="btn btn-primary" on:click={() => navigateToBusiness(business.id)}>View</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  {#if activeTab === 'links'}
    <button class="btn btn-primary" on:click={createLink}>Create Blank Link</button>

    <table class="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Type</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each links_list as link (link.id)}
          <tr>
            <td>{link.name}</td>
            <td>{link.type}</td>
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
</div>
