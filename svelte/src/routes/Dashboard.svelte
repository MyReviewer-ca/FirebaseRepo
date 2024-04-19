<script>
  import {addDoc, collection, getDocs} from 'firebase/firestore';
  import {onMount} from 'svelte';

  let businessesList = [];

  onMount(async () => {
    const businesses = collection(window.db, 'businesses');
    const businessesSnapshot = await getDocs(businesses);
    businessesList = businessesSnapshot.docs.map((doc) => {
      return {id: doc.id, ...doc.data()};
    });
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
</script>

<div class="container">
  <h1>Dashboard</h1>
  <button class="btn btn-primary" on:click={createBusiness}>Create Business</button>
  <button class="btn btn-primary" on:click={createLink}>Create Blank Link</button>
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
</div>
