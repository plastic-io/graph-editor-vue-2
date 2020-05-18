# graph-editor

Demo: https://plastic-io.github.io/graph-editor/graphs

Uses local storage

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Unit tests
```
npm run test:unit
```

### E2E tests
```
npm run test:e2e
```

# Graph Programming in Plastic-IO

In this integrated development environment (IDE), you can create and share graph programs.  Graph programs consist of 4 major parts:

* Graph
* Vectors
* View
* Bus

# Graph

Graphs in Plastic-IO are classed as "hypergraphs".  This means your graph can be imported into another graph where it will show up as a vector.  Graphs are made up of a collection of vectors.  Graphs have an explicit URL.  You can publish and share graphs.  Graphs can be executed on the client, or server, or both.  Graphs are domain agnostic.  It can execute anywhere JavaScript can execute.

# Vectors

Vectors are points on the graph.  Vectors in Plastic-IO are classed as "hypervectors".  This means your vector can have multiple sets of "edges" that connect your vector to other points on the graph.  Addtionally, each edge can be shared with multiple other vector's edges at the same time.  These "hyper edges" are called "connectors".  The relationship between the vectors, edges and connectors controls the flow of your graph program.

# View

Each vector has a "view".  When you view the graph, you can see the view of each vector on the graph.  You can edit the view of the vector directly in the IDE.  Vectors have an explicit URL.  You can publish and share vectors.  Although the Plastic-IO execution engine is rendering engine agnostic, this view on the graph editor uses Vue and Vuetify to render views.  It is currently not possible to use rendering engines other than Vue.

# Bus

Each vector has a "set" function. This set function dictates how data flows through the graph.  The flow of data through the graph is called "the bus".  Data always flows in one direction, left to right.  That doesn't mean you cannot create cyclic graphs, just that the edges and connectors in the graph must form a loop, graph execution does not flow right to left.

    Loop
    /----\
    |    |
    |    |
    \____/




