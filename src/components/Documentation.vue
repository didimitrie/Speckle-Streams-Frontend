<template lang="jade">
div
  div.row.middle-xs.height-35.bg-moss
    div.col-xs-8.col-xs-offset-2.text-center
      ui-icon(icon='map')
      h2 TODO: Proper Documentation
  div.row.height-75.middle-xs
    div.col-xs-10.col-xs-offset-1.col-lg-6.col-lg-offset-3
      //- h2 TODO: Write documentation
      //- hr
      div(v-html='compiledMarkdown')
  div.row(style='height:100px')

</template>

<script>
import marked from 'marked'

export default {
  computed: {
    compiledMarkdown() {
      return marked(this.featureList)
    }
  }, 
  data () {
    return {
      // an amazing paste of markdown. surely there's a smarter way.
      featureList: `
## Key points
- __Real time data broadcasting__: any change in the geometry/data is broadcast instantly to all receivers, web-based or grasshopper based. This enables a multi-user grasshopper workflow. 

- __Flexible structure__: you can add as many layers (inputs) as you need to one data stream. Moreover, structure is maintained: trees in, trees out. 

- __Versioning__: save specific points in time of your data stream for easy online retrieval. Coming soon: Gh retrieval too. 

- __Online Remote Control__: Have your Gh defintion act as a geometry/data server

## Grasshopper 2 Grasshopper
- Support for __almost all__ the GH/Rhino datatypes. __Geometry__: Meshes, Surfaces, Breps, Curves, Arcs, Planes, etc. __Abstract__: Numbers, Strings, Intervals, Interval2d, Colors
- __Structure integrity__: structure at one end is recreated at the other end. Single objects, lists, & trees of any sizes, shapes, and species: poplars, beech, etc.

## Grasshopper 2 Online Viewer
- Layers:
    + All input parameters defined in Grashopper become "layers" in the online viewer. This allows for easy data filtering and model navigation. 
    + Layers can be assigned different colours (saved only if you are logged in & the owner of the stream)
    + TODO: Support materials rather than colours
    + TODO: Individual object properties
- Supported geometry: 
    + Meshes, Surfaces, Breps, Curves, Planes, Points
- Supported Controllers:
    + Sliders, Toggles
    + TODO: Interval, Strings, MD Slider, Graph Mapper

## Coming Soon: Definition Packager! 
This will allow you to "detach" your grasshopper from the online viewer, essentially enabling model exploration without the necessity of having GH running.

## Coming Soon: Query API
Mostly for importing data into Excel and Google sheets in an easy & transparent manner. 

## Coming Soon: GH remote control 
Controlling a stream from another grasshopper definition, essentially enabling client-server relationships. If interested in embarking on this, [give me a shout](mailto:d.stefanescu@ucl.ac.uk).

## Wanted: Dynamo devs
It would be nice to give Dynamo a shot as well. The tech stack on the Gh component side should be easy to port into a zerotouch node or whatnot for dynamo. [Get in touch.](mailto:d.stefanescu@ucl.ac.uk)

## Coming Soon: NPM Package
So you could just go ahead and ~~~npm install~~~
`
    }
  }
}
</script>

<style>
</style>
