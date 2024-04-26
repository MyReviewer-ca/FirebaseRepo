<script>
  export let params = {};
  import {addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc, where} from 'firebase/firestore';
  import {onMount} from 'svelte';

  let data = {};
  let links_list = [];
  let emails_list = [];
  let reviews_list = [];
  var isLoading = true;

  async function refresh() {
    isLoading = true;
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
    await getLinks();
    await getEmails();
    await getReviews();
    isLoading = false;
  }

  onMount(async () => {
    refresh();
  });

  async function handleEdit(key) {
    try {
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
      refresh();
    } catch (e) {
      console.error(e);
      alert(e.message || 'An error occurred');
    }
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
          refresh();
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

  async function getEmails() {
    //get docs in emails collection where business_id is params.id
    const emails = collection(window.db, 'emails');
    const q = query(emails, where('business_id', '==', params.id));
    const emailsSnapshot = await getDocs(q);
    emails_list = emailsSnapshot.docs.map((doc) => {
      return {id: doc.id, ...doc.data()};
    });
    return emails_list;
  }

  async function getReviews() {
    //business_id/reviews/review_id
    const reviews = collection(window.db, 'businesses', params.id, 'reviews');
    const q = query(reviews, orderBy('review_date', 'desc'));
    const reviewsSnapshot = await getDocs(q);
    reviews_list = reviewsSnapshot.docs.map((doc) => {
      return {id: doc.id, ...doc.data()};
    });
  }

  function sendEmails() {
    //ask for .csv file (create a file input)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const dataToSend = {
          business_id: params.id,
          emails: lines.map((line) => line.split(',')),
        };

        //send post request to /send_emails
        const response = await fetch('/send_emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
        const result = await response.json();
        alert(result.message);
        refresh();
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }

  var today = new Date();
  var thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);

  var startDate = thirtyDaysAgo.toISOString().split('T')[0];
  var endDate = today.toISOString().split('T')[0];
  var email = 'admin@myreviewer.ca';
  function sendReport() {
    //send post request to /send_report
    var dataToSend = {
      business_id: params.id,
      start_date: startDate,
      end_date: endDate,
      send_email: email,
    };
    fetch('/send_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
      });
  }
  let activeTab = 'about';
</script>

<div class="container">
  {#if isLoading}
    isLoading...
  {:else}
    <button class="btn btn-secondary" on:click={window.spa.pop}>Back</button>

    <h1>{data.name}</h1>

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
      <li class="nav-item">
        <a class="nav-link" class:active={activeTab === 'report'} on:click={() => (activeTab = 'report')}>Report</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" class:active={activeTab === 'stripe'} on:click={() => (activeTab = 'stripe')}>Stripe</a>
      </li>
    </ul>

    {#if activeTab === 'about'}
      <!-- About tab content -->
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Attribute</th>
            <th scope="col">Value</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(data) as [key, value] (key)}
            <tr>
              <td>{key}</td>
              <td>{value.slice(0, 20)}</td>
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
      <button class="btn btn-primary" on:click={sendEmails}>Send Emails</button>

      <table class="table">
        <thead>
          <tr>
            <th scope="col">Email</th>
            <th scope="col">Viewed</th>
            <th scope="col">Sent Date</th>
          </tr>
        </thead>
        <tbody>
          {#each emails_list as email (email.id)}
            <tr>
              <td>{email.email}</td>
              <td>{email.viewed ? 'Yes' : 'No'}</td>
              <td>
                {email.sent_at.toDate().toLocaleDateString()}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

    {#if activeTab === 'links'}
      <button class="btn btn-primary" on:click={createLink}>Create Link</button>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Clicks</th>
            <th scope="col">Collected Reviews</th>
            <th scope="col">Redirected</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {#each links_list as link (link.id)}
            <tr>
              <td>{link.name}</td>
              <td>{link.total_clicks || 0}</td>
              <td>{link.total_collected_reviews || 0}</td>
              <td>{link.total_redirected || 0}</td>
              <td>
                <button
                  class="btn btn-primary"
                  on:click={() => {
                    //copy the link to the clipboard
                    window.copyClip(`${window.isDev ? 'http://127.0.0.1:5005' : 'https://review.myreviewer.ca'}/l/${link.id}`);
                    alert('Link copied to clipboard');
                  }}>Copy Link</button
                >
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

    {#if activeTab === 'reviews'}
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Rating</th>
            <th scope="col">Review Date</th>
            <th scope="col">View</th>
          </tr>
        </thead>
        <tbody>
          {#each reviews_list as review (review.id)}
            <tr>
              <td>{review.rating}</td>
              <td>{review.review_date.toDate().toLocaleString()}</td>
              <td>
                <button
                  class="btn btn-primary"
                  on:click={() => {
                    window.spa.push(`/b/${params.id}/${review.id}`);
                  }}>View</button
                >
              </td></tr
            >
          {/each}
        </tbody>
      </table>
    {/if}

    {#if activeTab === 'report'}
      <h2>Report</h2>
      <div class="form-group">
        <label for="start">Start Date:</label>
        <input type="date" id="start" bind:value={startDate} class="form-control" required />
      </div>
      <div class="form-group">
        <label for="end">End Date:</label>
        <input type="date" id="end" bind:value={endDate} class="form-control" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" bind:value={email} class="form-control" required />
      </div>
      <button class="btn btn-primary" on:click={sendReport}>Send</button>
    {/if}

    {#if activeTab === 'stripe'}
      <h2>Stripe</h2>
      <p>Coming soon</p>
    {/if}
  {/if}
</div>
