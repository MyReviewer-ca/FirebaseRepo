<script>
  import {doc, getDoc} from 'firebase/firestore';
  import {onMount} from 'svelte';
  export let params = {};
  let data = {};
  var isLoading = true;
  var isError = false;
  var stars_count = 0;
  var selectedStars = 0;
  const urlParams = new URLSearchParams('?' + window.location.href.split('?')[1]);
  if (urlParams.get('stars_count')) {
    stars_count = parseInt(urlParams.get('stars_count'));
  }
  var page = 'stars';

  onMount(async () => {
    if (urlParams.get('page')) {
      page = urlParams.get('page');
      isLoading = false;
      return;
    }
    const businessId = params.id;
    if (businessId) {
      try {
        const business = await getDoc(doc(window.db, 'businesses', businessId));
        var d = business.data();
        data = {
          name: d.name || '',
          business_id: business.id || '',
          logo_url: d.logo_url || '',
          redirect_url: d.redirect_url || '',
        };

        window.document.title = `Review ${data.name}`;

        //get radio button with same value as stars_count and check it

        isLoading = false;
        //wait 10ms
        await new Promise((r) => setTimeout(r, 10));
        var radio = document.querySelector(`input[value="${stars_count}"]`);
        if (radio) {
          radio.checked = true;
        }
      } catch (e) {
        page = 'error';
        console.error(e);
        isLoading = false;
      }
    } else {
      page = 'thanks';
      isLoading = false;
    }
  });

  async function next() {
    if (page == 'stars') {
      if (document.querySelector('input[name="rating"]:checked')) {
        stars_count = parseInt(document.querySelector('input[name="rating"]:checked').value);
        isError = false;
        if (stars_count > 3) {
          page = 'to_google';
        } else {
          page = 'review';
        }
      } else {
        isError = true;
      }
    } else if (page == 'review') {
      const review = document.querySelector('#review').value;
      if (review) {
        saveReview();
        isError = false;
        page = 'thanks';
      } else {
        isError = true;
      }
    } else if (page == 'to_google') {
      saveReview();
      if (data.redirect_url != '') {
        window.location.href = data.redirect_url;
      } else {
        page = 'error';
      }
    }
  }

  async function saveReview() {
    isLoading = true;
    var dataToSend = {
      business_id: data.business_id,
      rating: stars_count,
      review: '',
      redirected_to_google: page == 'to_google',
    };
    if (document.querySelector('#review')) {
      dataToSend.review = document.querySelector('#review').value || '';
    }
    if (urlParams.get('email_id')) {
      dataToSend.email_id = urlParams.get('email_id');
      dataToSend.received_from = 'email';
    } else if (urlParams.get('link_id')) {
      dataToSend.link_id = urlParams.get('link_id');
      dataToSend.received_from = 'link';
    }

    //send post request to http://127.0.0.1:5001/myreviewrca/us-central1/submit_review
    var url = '/submit';
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        isLoading = false;
      })
      .catch((error) => {
        isLoading = false;
      });
  }

  window.document.body.style.backgroundColor = '#29A5C3';
</script>

<div>
  <div class="container mt-5">
    <div class="card">
      {#if isLoading}
        <div class="card-body center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      {:else if page == 'stars'}
        <div class="card-body">
          {#if data.logo_url != ''}
            <div class="logo">
              <img src={data.logo_url} alt={data.name} />
            </div>
          {/if}
          <h2>Review for {data.name}</h2>
          <form>
            <!-- Rating input -->
            <div class="mb-3">
              <div id="rating">
                <div class="form-check">
                  <input class="form-check-input {isError ? 'is-invalid' : ''}" type="radio" name="rating" id="rating5" value="5" required />
                  <label class="form-check-label stars" for="rating5">★★★★★</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input {isError ? 'is-invalid' : ''}" type="radio" name="rating" id="rating4" value="4" required />
                  <label class="form-check-label stars" for="rating4">★★★★</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input {isError ? 'is-invalid' : ''}" type="radio" name="rating" id="rating3" value="3" required />
                  <label class="form-check-label stars" for="rating3">★★★</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input {isError ? 'is-invalid' : ''}" type="radio" name="rating" id="rating2" value="2" required />
                  <label class="form-check-label stars" for="rating2">★★</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input {isError ? 'is-invalid' : ''}" type="radio" name="rating" id="rating1" value="1" required />
                  <label class="form-check-label stars" for="rating1">★</label>
                </div>
              </div>
            </div>

            <!-- Submit button -->
            <button type="button" class="btn btn-primary" on:click={next}>Next</button>
          </form>
        </div>
      {:else if page == 'review'}
        <div class="card-body">
          <h2>Review for {data.name}</h2>
          <p>Sorry that your experience was not optimal, please tell us how we can improve.</p>
          <form>
            <p class="stars">
              {#each Array(stars_count) as _, i}
                ★
              {/each}
            </p>
            <!-- Review input -->
            <div class="mb-3">
              <label for="review" class="form-label">Feedback</label>
              <textarea class="form-control {isError ? 'is-invalid' : ''}" id="review" rows="3"></textarea>
              {#if isError}
                <div class="invalid-feedback">Please provide feedback</div>
              {/if}
            </div>

            <!-- Submit button -->
            <button type="button" class="btn btn-primary" on:click={next}>Submit</button>
          </form>
        </div>
      {:else if page == 'to_google'}
        <div class="card-body">
          <h2>Thanks for the Feedback!</h2>
          <div class="center"><button class="btn btn-primary" on:click={next}>Leave us a Google review</button></div>
        </div>
      {:else if page == 'thanks'}
        <div class="card-body">
          <h2>Thanks for the Feedback!</h2>
        </div>
      {:else if page == 'error'}
        <div class="card-body">
          <h2>Something went wrong</h2>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .card {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }
  h2 {
    text-align: center;
  }
  .form-check {
    display: flex;
    align-items: center;
    margin-right: 1rem;
    gap: 10px;
  }
  .stars {
    font-size: 2.5rem;
    color: #fbbc04;
  }

  .logo img {
    max-width: 300px;
    max-height: 100px;
    margin: 0 auto;
    display: block;
    margin-bottom: 1rem;
  }

  .center {
    text-align: center;
    margin: auto;
  }
</style>
