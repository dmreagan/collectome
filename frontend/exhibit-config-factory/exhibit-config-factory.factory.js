angular.module('exhibitConfigFactory').factory('exhibitConfigFactory', () => {
  const exhibitConfigFactory = {};

  exhibitConfigFactory.config = {
    metadata: {
      name: 'My cool stuff',
      description: 'A meaningful description',
      authors: [
        { first_name: 'Paul', last_name: 'Dybala' },
        { first_name: 'Mario', last_name: 'Mandzukic' },
      ],
      institutions: ['X Univ.', 'Y Univ.'],
      disciplines: ['Visualization', 'Social Network Analysis'],
      tags: ['tagA', 'tagB'],
      public: true,
    },

    content: [
      {
        id: 'content1',
        title: 'Information Technology News',
        url: 'https://itnews.iu.edu/',
      },
      // { id: 'content2', title: 'Campus Map', url: 'http://map.iu.edu/iub/index.php' },
      { id: 'content2', title: 'IU UITS', url: 'https://uits.iu.edu/' },
      // { id: 'content3', title: 'IU Bloomington Newsroom', url: 'http://newsinfo.iu.edu/' },
      {
        id: 'content3',
        title: 'School of Informatics, Computing and Engineering',
        url: 'http://www.sice.indiana.edu/',
      },
      { id: 'content4', title: 'MIT', url: 'http://www.mit.edu/' },
    ],

    display: {
      columns: 4,
      rows: 2,
      tile_x_resolution: 1920,
      tile_y_resolution: 1080,
    },

    layout: {
      margins: { XPercent: 5, YPercent: 10 },
      containers: [
        {
          id: 'container1',
          originX: 0,
          originY: 0,
          sizeX: 1,
          sizeY: 2,
        },
        {
          id: 'container2',
          originX: 1,
          originY: 0,
          sizeX: 1,
          sizeY: 2,
        },
        {
          id: 'container3',
          originX: 2,
          originY: 0,
          sizeX: 2,
          sizeY: 2,
        },
      ],
    },

    mapping: [
      { content: 'content1', container: 'container1' },
      { content: 'content2', container: 'container2' },
      { content: 'content3', container: 'container3' },
    ],
  };

  return exhibitConfigFactory;
});
