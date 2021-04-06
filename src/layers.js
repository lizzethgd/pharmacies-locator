export const clusterLayer = {
    id: 'clusters',
    type: 'circle',
    source: 'pharmacies',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#ff6b6b', 100, '#ffa805', 750, '#af47ff'],
      'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
    }
  };
  
  export const clusterCountLayer = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'pharmacies',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  };
  
  export const unclusteredPointLayer = {
    id: 'unclustered-point',
    type: 'symbol',
    source: 'pharmacies',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image':  'crossPin',
      'icon-size': 0.5
    },
  };