# Collectome

## Collections

The central element of the Collectome is the concept of the _collection_. An collection is defined by a configuration in the form of a JavaScript `object`, which can be manipulated in code or saved to an external JSON file. Since the Collectome exlusively links to external content, without storing anything itself, a collection can be completely described by this simple config object. The Collectome is therefore a system for creating, editing, and viewing these collection configurations.

An collection will consist of the following:

- Unique ID
- Metadata
  - Author
  - Title
  - Description
  - Date
  - Keywords
  - ...
- Fork information
  - Parent ID
- Display
  - tile width in pixels
  - tile height in pixels
  - number of columns
  - number of rows
- Layout
  - Container
    - position in tiles
    - size in tiles
    - URL to content
    - scale/zoom value for content
  - ...

## Viewing Collections with Exhibit

The display module of the Collectome is called the _Exhibit_. The Exhibit is a service which transforms a collection configuration into a web page for display on a visualization wall. When a Collectome user wants to display a collection, they will get an exhibit URL from that collection's page in the Collectome. Possible forms for that URL are discussed below.

### Similar projects

Two noteworthy examples of such a service are the [Univeral Viewer](https://universalviewer.io/) and the [Tensorflow Embedding Projector](http://projector.tensorflow.org/).

#### Univeral Viewer

The Universal Viewer takes a JSON _manifest_ as a URL parameter and uses it to generate the display. An example is shown below.

```HTML
https://universalviewer.io/uv.html?manifest=http://iiif.bodleian.ox.ac.uk/iiif/manifest/60834383-7146-41ab-bfe1-48ee97bc04be.json#?c=0&m=0&s=0&cv=0&xywh=-4191%2C-378%2C14092%2C8274
```

The UV service itself is hosted at https://universalviewer.io/uv.html. The _manifest_ location is given as a URL parameter using the following syntax: `?manifest=https://path.to/manifest.json`.

#### Tensorflow Embedding Projector

The Tensorflow Embedding Projector uses a similar URL parameter system, but it wasn't operational at the time of this writing.

### Accessing collection configs

The systems in the previous section access their config files by storing the full URL as a parameter. This approach allows them the flexibility to accept configs from any source. The disadvantage is that the URL becomes long and unwieldy, since it contains another complete URL as a parameter. If the Exhibit adopted this approach it could save configs as JSON files in a public directory on any webserver, including public sites like GitHub. An exhibit URL with this approach could look something like:

```HTML
https://collectome.avl.iu.edu/exhibit?config=https://github.com/collectome/exhibit/config.json
```

Alternatively, the Exhibit could achieve drastically shorter URLs if it is willing to limit itself to accessing only configs which are stored in its own database. In this case, the URL parameter could simply be the ID of the collection.

```HTML
https://collectome.avl.iu.edu/exhibit?id=123
```

or even

```HTML
https://collectome.avl.iu.edu/exhibit/123
```
