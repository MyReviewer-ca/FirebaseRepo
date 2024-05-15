<script>
  import {doc, getDoc} from 'firebase/firestore';
  import {onMount} from 'svelte';
  import Loader from '../components/Loader.svelte';

  export let params = {};
  console.log(params);

  let data = {};
  let from = {};
  var isLoading = true;

  onMount(async () => {
    //get the business id and reveiw id from the params
    const businessId = params.id;
    const reviewId = params.review_id;

    //get review doc
    const review = await getDoc(doc(window.db, 'businesses', businessId, 'reviews', reviewId));
    data = review.data();

    console.log(data);
    if (data.received_from == 'email') {
      //get email doc
      const email = await getDoc(doc(window.db, 'emails', data.email_id));
      from = email.data();
      console.log(from);
      isLoading = false;
    } else if (data.received_from == 'link') {
      //get nfc doc
      const link = await getDoc(doc(window.db, 'links', data.link_id));
      from = link.data();
      console.log(from);
      isLoading = false;
    } else {
      isLoading = false;
    }
  });
</script>

<div class="container">
  {#if isLoading}
    <Loader />
  {:else}
    <button class="btn btn-secondary" on:click={window.spa.pop}>Back</button>
    <h1>Review</h1>
    <p>Rating: <br /><b>{data.rating}</b></p>
    <p>Feedback: <br /><b>{data.review ? data.review : 'No feedback given'}</b></p>
    <p>Feedback Category: <br /><b>{data.review_category ? data.review_category : 'N/A'}</b></p>

    <p>Redirected to google: <br /><b>{data.redirected_to_google ? 'Yes' : 'No'}</b></p>
    <p>Review date: <br /><b>{data.review_date.toDate().toLocaleString()}</b></p>

    <br /><br />
    <p>Received from: <br /><b>{data.received_from}</b></p>
    {#if data.received_from == 'email'}
      <p>Email: <br /><b>{from.email}</b></p>
      {#if from.viewed}<p>Email Viewed At: <br /><b>{from.opened_at.toDate().toLocaleString()}</b></p>{/if}
      <p>Email Sent At: <br /><b>{from.sent_at.toDate().toLocaleString()}</b></p>
    {/if}
    {#if data.received_from == 'link'}
      <p>Link: <br /><b>{from.name}</b></p>
      <p>Link Type: <br /><b>{from.type}</b></p>
    {/if}
  {/if}
</div>
