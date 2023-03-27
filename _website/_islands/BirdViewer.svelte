<script>
  export let name = ''
  export let beak = ''
  export let wing = ''
  export let feet = ''
  export let eyes = ''
  export let tail = ''

  let count = 0

  function incr () {
    count = count+1
  }
</script>

<h1>Bird</h1>
<p>name:{name}</p>
<p>beak:{beak}</p>
<p>wing:{wing}</p>
<p>feet:{feet}</p>
<p>eyes:{eyes}</p>
<p>tail:{tail}</p>

<p>sightings:{count}</p>

<button on:click={incr}>Click here to log a bird sighting</button>