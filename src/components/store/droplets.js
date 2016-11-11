export default {
  droplets: [],
  updateLiveDroplet( droplet ) {
    console.info('Updating live droplet in store.')
    let newDroplet = this.droplets[0]
    newDroplet.structure = droplet.structure 
    newDroplet.date = Date.now()
    this.droplets.$set(0, newDroplet )
  }
}