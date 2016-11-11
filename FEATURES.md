
# Speckle Streams

## Main Features

- __Real time data broadcasting__: any change in the geometry/data is broadcast instantly to all receivers, web-based or grasshopper based. This enables a multi-user grasshopper workflow. 
- __Flexible structure__: you can add as many "layers" (inputs) as you need to one data stream. Moreover, structure is maintained: trees in, trees out. 
- __Versioning__: save specific points in time of your data stream for easy online retrieval. Coming soon: Gh retrieval too. 
- __Online Remote Control__: Have your Gh defintion act as a geometry/data server
- 

## Specs: 
### Grasshopper <-> Grasshopper

- Support for almost all the GH/Rhino datatypes:
    + Geometry: Meshes, Surfaces, Breps, Curves, Arcs, Planes, etc.
    + Abstract: Numbers, Strings, Intervals, Interval2d, Colors

- Structure integrity: structure at one end is recreated at the other end.
    + Single objects, lists
    + Trees of any sizes, shapes, and species: poplars, beech, etc.

### Grasshopper <-> Online Viewer

- Layers:
    + All input parameters defined in Grashopper become "layers" in the online viewer. This allows for easy data filtering and model navigation. 
    + Layers can be assigned different colours (saved only if you are logged in & the owner of the stream)
    + TODO: Support materials rather than colours
    + TODO: Individual object properties


- Supported geometry: 
    + Meshes, Surfaces, Breps, Curves, Planes, Points

- Supported Controllers:
    + Sliders
    + Toggles
    + TODO: Interval
    + TODO: Strings
    + TODO: 2d Sliders
    + TODO: Graph Mapper