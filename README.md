# Plastic-IO Graph Editor

![plastic-io](https://avatars1.githubusercontent.com/u/60668496?s=200&v=4)

[Demo](https://plastic-io.github.io/graph-editor/graphs)

# Table of Contents

1. [What is Plastic-IO](#what-is-plastic-io)
    1. [Overview](#overview)
    2. [What is Plastic-IO for?](#what-is-plastic-io-for)
    3. [What are the major features of Plastic-IO?](#what-are-the-major-features-of-plastic-io)
    4. [Where can I run Plastic-IO?](#where-can-i-run-plastic-io)
2. [Installation](#installation)
    1. [Local Sandbox](#local-sandbox)
    2. [Public Editor with Private Graph Server](#public-editor-with-private-graph-server)
    3. [Private Editor and Server](#private-editor-and-server)
3. [provider-settings](#provider-settings)
4. [How does this work?](#how-does-this-work)
    1. [Core Concepts](#core-concepts)
        1.   [Graph](#graph)
        2.  [Vectors](#vectors)
        3. [View](#view)
        4.  [Bus](#bus)
    2. [What are Plastic-IO Graphs?](#what-are-plastic-io-graphs)
    3. [Executing Graphs on the browser](#executing-graphs-on-the-browser)
    4. [Executing Graphs on the Graph Server](#executing-graphs-on-the-graph-server)
    5. [Environments and Publishing](#environments-and-publishing)
    6. [Sharing Vectors and Graphs](#sharing-vectors-and-graphs)
        1.  [Infrastructure as a Graph](#infrastructure-as-a-graph)
        2. [Maximize Code Reuse](#maximize-code-reuse)
5. [Extending The Graph Editor](#extending-the-graph-editor)
    1. [How To Create A Plugin](#how-to-create-a-plugin)
    2. [Plugin Types](#plugin-types)
    3. [Plugin Components](#plugin-components)
    4. [Plugin Template](#plugin-template)
6. [Client Server Sequence Diagram](#client-server-sequence-diagram)
7. [Implementing the Graph Scheduler Directly](#implementing-the-graph-scheduler-directly)
    1. [Going Deeper](#going-deeper)
8. [Contributing](#contributing)
    1.   [Graphs and Vectors](#graphs-and-vectors)
    2.  [Graph Editor IDE](#graph-editor-ide)
    3. [Graph Server Lambda](#graph-server-lambda)
    4.  [Artwork](#artwork)
9. [Installing Development Graph Editor](#Installing-Development-Graph-Editor)


# What is Plastic-IO?

## Overview

Visual programming using a graph interface.  If you can hook up a cable box, you can write programs in Plastic-IO.  Click and drag vectors into your graph, then connect them together and run it.

## What is Plastic-IO for?

Plastic-IO is a general purpose graph programming language.  It can be used to create any sort of program in any domain.  Here's a few ideas:

* Build your entire microservice architecture as reusable graphs and vectors.
* Build an entire front facing web site, code and views on the same graph.
* Create a highly mailable services facade to control the shape and flow of your existing APIs.
* Create your massively parallel CLI build pipeline.

Declarative graph programming is great for parallel and asynchronous tasks and generally runs faster and can be built in less time than imperative programming.

## What are the major features of Plastic-IO?

* Build your components in the same interface where you build your graph.
* Pure serverless environment.  Plastic-IO only uses lambdas and CDN based client applications.
* Event Sourced Graph Database ensures you can rewind or fast-forward changes made to your graph.
* Multiuser debug environment for server side _and_ client side programming.
* See the actual animated server data flow in your program _live_ via web sockets.
* Typescript Graph Scheduling Engine built on promises from the ground up.
* Distributed graph schema allows for in-line or runtime side loaded resources to optimize performance.
* Immutable artifact system allows for instant safe reuse of components in other graphs.
* Public and private registries for cataloging and sharing graph components.
* Graph Design and Presentation views allow for live editing of highly complex asynchronous web sites.

## Where can I run Plastic-IO?

Plastic-IO graphs are domain agnostic.  If it can run JavaScript, it can run a Plastic-IO graph.  Just like JavaScript, Plastic-IO vectors and graphs can run in mixed domains, although some are dedicated to a specific domain, for example, a vector that reads files from the file system will likely not work in the browser domain, but will work in the server or CLI domains.  Vectors and graphs are tagged with which domains they work in, so you can make sure you're using the right kind.

# Installation

You can install Plastic-IO in three ways.

1. Use the [public version](https://plastic-io.github.io/graph-editor/graphs) in a local sandbox.
2. Use the [public version](https://plastic-io.github.io/graph-editor/graphs) connected to a private graph server.
3. Deploy your own Graph Editor IDE and connect to a private graph server.

The instruction below cover each use case.

## Local Sandbox

1. Open your [graph editor](https://plastic-io.github.io/graph-editor/graphs) and start making graphs.

No installation required.  Graphs and vectors you make are saved to your browser, but you can still export them to files to be shared with others.

## Public Editor with Private Graph Server

1. Install the AWS based [Plastic-IO Graph Server](https://github.com/plastic-io/graph-server)
2. Create a free account with [Auth0](https://auth0.com/), setup a SPA and an API for your Graph-Editor and Graph-Server.
3. Configure your provider settings here at `/graph-editor/provider-settings`.
4. Open your graph editor and start making graphs.

## Private Editor and Server

This is the recommended way to install the program for use in an enterprise environment.  This will ensure that changes to the public graph editor have no impact on your system.

1. Install the AWS based [Plastic-IO Graph Server](https://github.com/plastic-io/graph-server)
2. Create a free account with [Auth0](https://auth0.com/), setup a SPA and an API for your Graph-Editor and Graph-Server.
3. Clone the [graph-editor](https://github.com/plastic-io/graph-editor) repository.
4. Change to the repository directory
5. Optional: add a .env file using [the instructions below](https://github.com/plastic-io/graph-editor#provider-settings).
6. Run `npm install && npm run build`
7. Copy the content of the `/dist` directory to your CDN.
8. Set your CDN to use the `/dist/index.html` file as the 404 page, and configure the CDN to return 200 status code.
9. Open `/graph-editor/provider-settings` and configure your browser. 



# Provider Settings

When using the public CDN graph editor, you can change which server you're connected to by visiting the [provider settings page](https://plastic-io.github.io/graph-editor/provider-settings) on the public graph editor.  The settings are saved to the browser.

Alternatively, you can deploy your own instance of the graph editor to your own CDN.  This makes it so the graph editor is hosted in your network where you have more control over it.  When hosted this way, you can automatically fill out the values of provider settings page by setting an `.env` file in the root of your project with the following values:

| Property                         | Description                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| VUE_APP_GRAPH_HTTP_SERVER        | The HTTPS endpoint of your graph server instance, provider after graph server deploy.    |
| VUE_APP_GRAPH_WSS_SERVER         | The WSS endpoint of your graph server instance, provider after graph server deploy.      |
| VUE_APP_AUTH_PROVIDER_NAME       | The authentication provider name.  Currently only auth0 is supported.                    |
| VUE_APP_AUTH_DOMAIN              | The authentication domain name.  Provided by your authentication provider.               |
| VUE_APP_AUTH_CLIENT_ID           | The authentication client ID.  Provided by your authentication provider.                 |
| VUE_APP_AUTH_AUDIENCE            | The authentication audience.  Provided by your authentication provider.                  |
| VUE_APP_FORCE_SERVER             | When true, the provider-settings page is disabled and forced to use the above settings.  |


Example `.env` file:

  VUE_APP_GRAPH_HTTP_SERVER=https://7hcv242f49.execute-api.us-east-1.amazonaws.com/dev/
  VUE_APP_GRAPH_WSS_SERVER=wss://w84525agw3.execute-api.us-east-1.amazonaws.com/dev
  VUE_APP_AUTH_PROVIDER_NAME=auth0
  VUE_APP_AUTH_DOMAIN=dev-32-g55ap.us.auth0.com
  VUE_APP_AUTH_CLIENT_ID=V352372k7efF4asfsJyizdfasasUKl
  VUE_APP_AUTH_AUDIENCE=plastic-io-graph-server
  VUE_APP_FORCE_SERVER=false


# How does this work?

## Core Concepts

In this integrated development environment (IDE), you can create and share graph programs.  Graph programs consist of 4 major parts:

* Graph
* Vectors
* View
* Bus

### Graph

Graphs in Plastic-IO are classed as "hypergraphs".  This means your graph can be imported into another graph where it will show up as a vector.  Graphs are made up of a collection of vectors.  Graphs have an explicit URL.  You can publish and share graphs.  Graphs can be executed on the client, or server, or both.  Graphs are domain agnostic.  It can execute anywhere JavaScript can execute.

### Vectors

Vectors are points on the graph.  Vectors have an explicit URL.  Vectors in Plastic-IO are classed as "hypervectors".  This means your vector can have multiple sets of "edges" that connect your vector to other points on the graph.  Additionally, each edge can be shared with multiple other vector's edges at the same time.  These "hyper edges" are called "connectors".  The relationship between the vectors, edges and connectors controls the flow of your graph program.

### View

Each vector has a view.  The graph itself has a view as well.  When you use the graph editor, you can see the view of each vector or graph.  You can edit the view of the vector directly in the IDE.  Although the Plastic-IO execution engine is rendering engine agnostic, this view on the graph editor uses Vue and Vuetify to render views.  It is currently not possible to use rendering engines other than Vue.

Each vector on the graph is registered as a Vue component with the following name `vector-<vector-id>` where `<vector-id>` is the
  unique ID of the vector.  The graph itself is also registered as a Vue component with the following name `vector-<graph-id>` where `<graph-id>` is the unique id of the graph.  The graph view is only visible when in presentation mode.  By setting the graph to start in presentation mode you can create functional web sites that can be presented to end users.

When a graph is imported into another graph, the graph view template gains the property `vector` that represents the host vector.

### Bus

Each vector has a "set" function. This set function dictates how data flows through the graph.  You can edit the set function of the vector directly in the IDE.  The flow of data through the graph is called "the bus".  Data always flows in one direction, left to right.  This meams data always "comes out" of the right hand side of a vector and "goes into" the left side a vector.

## What are Plastic-IO Graphs?

Plastic-IO graphs are a high level graph programming language built on top of JavaScript and executed with the [Plastic-IO Scheduling Engine](https://github.com/plastic-io/plastic-io).  Plastic-IO graphs are stored as JSON files.  The GUI for Plastic-IO is the [Plastic-IO Graph Editor IDE](https://github.com/plastic-io/graph-editor).

## Executing Graphs on the browser

Graph can be executed directly in the design view of the editor, however you can also set your graph to "Presentation Mode".
In presentation mode, connectors not marked "Visible in Presentation" will be hidden.  The template that is displayed is defined
on the graph properties.  From this template you can display other vectors on your graph or enter your own template code.

When a vector's set function is being invoked, the `this` object contains a few helpful properties:

| Property     | Description                         |
| ------------ | ----------------------------------- |
| props        | Vue Component props of this vector. |
| component    | Vue Component instance.             |


## Executing Graphs on the Graph Server

When you installed your server, you took note of the endpoint beginning with `ANY - https://`.  This is where your graphs can be executed from.  Where you see `<root>` below is where you would put your HTTP server.

    ANY - https://4bc4u834549.execute-api.us-east-1.amazonaws.com/dev/{proxy+}

Your graph URL goes where you see {proxy+}

_Note: In production `/dev/` is not present at the end of the `ANY` URL._

You can execute graphs on the server by subscribing events to the lambda "DefaultRoute" in this project.  By default, all unbound HTTP traffic to the domain will come to the graph route.  What graph gets executed is based on the URL.

    <root>/<graph.url>.<graph.vector[].url>


    Example:
    The following URL would run vector "html" on graph "home"

    https://mysite.com/home.html

Graphs are stored by their URL.  Once the graph is looked up, the scheduler is invoked with the matching vector's URL.

If no vector URL is specified, the vector URL "index" is assumed.  Similarity, if no graph URL is specified, the graph "index" is assumed.  That makes the default route to the server "/" the graph "index" and the vector "index".

When a vector's set function is being invoked, the `this` object contains a few helpful properties:

| Property     | Description                                                                              |
| ------------ | ---------------------------------------------------------------------------------------- |
| event        | The AWS request event.                                                                   |
| context      | The AWS request context.                                                                 |
| callback     | The AWS request HTTP callback.                                                           |
| AWS          | The AWS library.                                                                         |
| console      | Web socket console transmitter.  Sends log data to the client side Graph Editor IDE.     |

    // example callback
    this.callback(null, {
        statusCode: 200,
        body: "Hello World!"
    });

This is quite literally the AWS callback method passed to the lambda.  If you do not call it within 30 seconds, it will automatically be called and a timeout will be logged.  Your lambda can run for longer than 30 seconds, but API gateway requires all HTTP responses end within 30 seconds.

## Environments and Publishing

When you publish a graph, that graph becomes available in the production environment.  Changes to the graph will not take effect until you publish the graph once again.  You can still test your graph in the development environment after each change.

## Sharing Vectors and Graphs

When you publish your vector or graph, it becomes available to other users of your Graph Database.  These published versions are immutable and free of dependency issues.  Once a graph or vector is published, users of that artifact can be sure it will never change.  Past versions are listed right next to current versions and clearly labeled.

You can also share your graphs and vectors by downloading them via links provided in the IDE and then clicking and dragging the files onto other graphs.  Unlike using published graphs and vectors, importing this way causes the imported artifact to originate on the graph you are currently editing, where published vectors and graphs are linked and can potentially have their data side loaded.

### Infrastructure as a Graph

Because you can share the parts of the graph, and entire hypergraphs, Plastic-IO server allows you to build your entire infrastructure using first "low level" JavaScript and then higher level graphical programming, all within the multiuser [Plastic-IO IDE](https://github.com/plastic-io/graph-editor).

### Maximize Code Reuse

Because each vector and graph in Plastic-IO are implicitly modular, this makes it so you can reuse the artifacts you create in other graphs very easily.  Plastic-IO graph server provides a marketplace of graphs and vectors for developers to choose from, safely and securely.



# Extending The Graph Editor

You can add your own components to the graph editor using the vue plugin framework.  This is the way the graph editor imports its own components.

## How To Create A Plugin

Here are the steps to create a plugin.  Below that is a plugin template.

1. Make a fork of this project (https://github.com/plastic-io/graph-editor).
2. Make a new file to hold your plugin, usually in `/src/plugins`.
3. Copy the template below into your new file and name the file your plugin's name.
4. Edit `/src/main.ts`.  Import your plugin file.  E.g.: `import MyPlugin from "./plugins/MyPlugin";`.
5. Add your plugin inside of the `--- ADD PLUGINS BETWEEN THESE LINES ---` lines.  E.g.: `Vue.use(MyPlugin(store));`.

## Plugin Types

* vectorProperties
* graphProperties

### Plugin Components

When using the `addPlugin` action to define a `vectorProperties` plugin or `graphProperties` plugin, you must select an icon that is registered in the vuetify icon library.  You can select an icon from the [mdi-icons list](https://cdn.materialdesignicons.com/4.9.95/) or you can register custom icons, [instructions](https://vuetifyjs.com/en/features/icons/#material-design-icons).  When a user clicks the tab with your plugin, your component will load in the tab content area.  Trying to register a component to a non existent plugin type will cause an error.

## Plugin Template
```
    module.exports = function (context) {
        return {
            install: () => {
                const store = {
                    namespaced: true,
                    state: {
                        status: "PENDING",
                    },
                    mutations: {
                        SET_STATUS(state, e) {
                            state.status = e;
                        },
                    },
                    actions: {
                        changeStatus(context, e) {
                            context.commit("SET_STATUS", e);
                        }
                    },
                };
                // add graph editor plugins
                context.commit("addPlugin", {
                    type: "vectorProperties",
                    icon: "mdi-flask",
                    component: TestView,
                });
                // add custom store
                context.registerModule('slg-vuex-module-template', store);
            }
        };
    };
```

# Client Server Sequence Diagram

    +-----------+ +------------------+ +-----------------------------+       +----------------+
    |           | |                  | |                             |       |                |
    |  Browser  | |   Local Graph    | |   Local Remote Graph Copy   |       |  Remote Graph  |
    |           | |                  | |                             |       |                |
    +-----+-----+ +--------+---------+ +-------------+---------------+       +--------+-------+
          |                |                         |                                |
          |               +++                        |                               +++
          +----Change---> | | +----Diff Calc----------------Change sent to Server--> | |
          |               | |                        |                               | |
          |               | |                       +++                              | |
          |               | |                       | |                              | |
          |               | | <----Diff Calc------+ | | <---Change Sent to Client--+ | |
          |               +++                       +++                              +++
          |                |                         |                                |
          |                |                         |                                |

# Implementing the Graph Scheduler Directly

If you use the Graph-Editor and Graph-Server together all of this is abstracted from you and you can concentrate on graph programming.  However if you want to use the scheduling engine directly, it is very easy to do.

Plastic-IO uses a number of code build and analysis tools to build and execute code held in graphs or side loaded in via registries and CDNs.  Compiled code executes through the graph scheduling engine.

To get started, a graph is built then passed to the scheduler.

`const scheduler = new Scheduler(graph, {}, {}, console);`

Next, let the scheduler know which vector to invoke first by using the vector's URL.

`scheduler.url('my-vectors-url');`

And that's it!  The code within the graph's vectors takes care of the rest.

You can hook into a variety of events listed in the scheduling engine documentation if you want to log or react to different events and changes that occur during the runtime of the graph.


## Going Deeper

Scheduling engine documentation: [Scheduler](https://plastic-io.github.io/plastic-io/classes/_scheduler_.scheduler.html)

# Contributing

We offer a very free and open environment where you can express yourself in a multitude of ways, and showcase your creations to the world!  There are four major paths of contribution.

## Graphs and Vectors

Always looking for contributors to our public catalog.  At Plastic-IO we maintain a catalog of user generated graphs and vectors that are available by default to all installation of the graph-editor.

You can contribute to the core public artifact registry by making pull requests to the [Graph Registry](https://github.com/plastic-io/registry) repository.  From there you can create categories and sub-categories of your work and make it available to the public.

Your creations can be in any domain (browser, aws server, CLI), and you can use your own creations to make new creations.  Even mix and match creations from other people in your new creations and repeat.

Here's a few ideas:

* Navigation bar component with drop down menus
* Reusable table with XHR paging support
* Closed loop CRUD system for you favorite AWS data storage solution
* Web page skeleton that people can modify to make their own
* Build pipeline configuration builder
* Admin web site with basic CRUD functionality
* MIDI component synthesizer using a lib like [Tone.js](https://tonejs.github.io/)
* Visualization pipeline using a lib like [LiquidFun](http://google.github.io/liquidfun/)

Make them and publish them so others can use them directly or use them as building blocks in another creation.

## Graph Editor IDE

The Graph Editor IDE itself is always in need of love.  Built with Typescript, Vue, Vuex, and Vuetify, the graph-editor both produces the graphs that are executed by the scheduling engine, but also renders the views built into the graphs and vectors.  It is also responsible for displaying events that occur in the graph execution runtime environment, both on the server and the browser using web sockets.

Contributing to the graph editor is not for beginners, but there are some tickets that are easier to accomplish than others.  If you think you're up to the task check out the [issues](https://github.com/plastic-io/graph-editor/issues) page and look for the "good first time issue" tag.

## Graph Server Lambda

The [Graph Server](https://github.com/plastic-io/graph-server) is an AWS HTTP Lambda {proxy+} implementation of the graph server.  Using event sourcing and a publishing pipeline, the graph server lambda represents an entire micro service architecture framework.  Graphs are accessed via their registered URLs and served to the users as HTTPS APIs.  Graphs running on the graph server have full access to the AWS infrastructure and can do anything AWS allows.

Work on the graph server is not for beginners.  Here we are creating new O(1) routing paradigms that fit with graph programming.  Additionally the graph server is used to communicate debugging and business intelligence events to AWS cloud watch and the Graph Editor IDE.  These are highly complex system and require a skilled and careful hand to maintain.  If you think you're up for it check out the [issues](https://github.com/plastic-io/graph-server/issues) list on the graph server.

## Artwork

There is a limited set of [media assets](https://github.com/plastic-io/media) here.  Contributions to the asset set  is always welcome.  There are no current issues opened, but feel free to create an issue and make a PR.

# Installing Development Graph Editor
 
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

