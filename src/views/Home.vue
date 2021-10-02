<template>
  <div class="home container">
    <div>
      <p>no time for a homepage.</p>
      <p>basically my personal bike tools/calculators</p>
      <p>clearly i am a nerd... and i like to ride my bike</p>
      <p>more features coming soon...</p>
    </div>
    <div class="is-centered">
      <h1>some resources i love</h1>
      <div v-for="(item, index) in links" :key="index" :value="item.url">
        <a :href="item.url" target="_">{{ item.label }}</a>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  components: {},
  data: () => ({
    links: [
      {
        url: "https://www.sheldonbrown.com/",
        label: "sheldownbrown.com",
      },
      {
        url: "https://www.stevehoggbikefitting.com/",
        label: "stevehoggbikefitting.com",
      },
      {
        url: "https://www.aero-coach.co.uk/learn#beginhere",
        label: "aero-coach.co.uk",
      },
    ],
  }),
};
</script>
