<script>
  import {signInWithEmailAndPassword} from 'firebase/auth';
  import {onMount} from 'svelte';
  let email = '';
  let password = '';

  function handleSubmit() {
    signInWithEmailAndPassword(window.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        window.spa.push('/dashboard');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        alert(errorMessage);
      });
  }

  onMount(() => {
    if (window.auth.currentUser !== null) {
      window.spa.push('/dashboard');
    }
  });
</script>

<div class="container">
  <div class="row justify-content-center">
    <div class="col-6">
      <h2 class="text-center">Login</h2>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="email">Email address</label>
          <input type="email" class="form-control" id="email" bind:value={email} placeholder="Enter email" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" class="form-control" id="password" bind:value={password} placeholder="Password" />
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </div>
  </div>
</div>
