/*
  NOTE: The tile xI, yI index-origo (0, 0) is also the pixel origo of the canvas (0px, 0px)
  but the canvas origo is programmatically changed (setTransform) to being off the screen (at the start of the game) to allow map scrolling.
  The canvas origo is constantly changed during the user scrolling the map, but that changed origo position
  is always referenced using (0px, 0px) as the Canvas takes care of the context changes.
*/
const MapData = {
  cols: 24,
  rows: 24,
  tileDiagonalWidth: 150,
  tileDiagonalHeight: 75,
  drawTileLayersBehindEnemyThresholdXi: 18, // the xI threshold col to draw enemy sprite behind the map tile layers
  drawTileLayersBehindEnemyThresholdYi: 5,
  allowedTilesOnWater: [4], // tile type id 4 in Mapdata.tiles
  forcedDisallowedTilesOnWater: [
    [5, 6],
    [5, 8],
    [5, 9],
    [7, 1],
    [7, 5],
    [8, 1],
    [8, 5],
    [9, 5],
    [10, 5],
    [11, 5],
    [12, 5],
    [13, 5],
    [14, 5],
    [15, 5],
    [16, 5],
    [17, 5],
    [14, 17],
    [15, 17],
    [16, 17],
    [18, 7],
    [18, 8],
    [18, 9],
    [18, 10],
    [18, 11],
    [18, 12],
    [18, 13],
    [18, 14],
    [18, 15],
    [16, 20],
    [16, 21],
    [16, 22],
    [17, 19],
    [17, 20],
    [17, 21],
    [17, 22],
    [18, 19],
    [18, 20],
    [18, 21],
    [18, 22],
    [19, 18],
    [19, 19],
    [19, 20],
    [19, 21],
    [19, 22],
    [20, 12],
    [20, 14],
    [20, 18],
    [20, 19],
    [20, 20],
    [20, 21],
    [20, 22],
    [21, 15],
    [21, 18],
    [21, 19],
    [21, 20],
    [21, 21],
    [21, 22]
  ], // hard coded exclusions on allowed tiles [Xi, Yi] (for creating the allowed matrix map for water area)
  allowedTilesOnLand: [0, 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 43],
  enemyWinTargetPositions: [
    [5, 12], [11, 14], [16, 7], [11, 14], [16, 5], [16, 6]  // first 3 indexes are the tower tagets and rest are for allowing pathfinding to those
  ],
  tiles: [
    {src: 'assets/images/base.png', width: 150, height: 75}, // 0
    {src: 'assets/images/b1-2.png', width: 150, height: 150}, // 1
    {src: 'assets/images/b1.png', width: 150, height: 150}, // 2
    {src: 'assets/images/sands_stone_base.png', width: 152, height: 95}, // 3
    {src: 'assets/images/water_waves.png', width: 152, height: 95}, // 4
    {src: 'assets/images/water_stones.png', width: 152, height: 95}, // 5
    {src: 'assets/images/sands_water_left_half2.png', width: 150, height: 95}, // 6
    {src: 'assets/images/sands_water_bottom_half_left_top.png', width: 150, height: 95}, // 7
    {src: 'assets/images/sands_water_right_half.png', width: 150, height: 95}, // 8
    {src: 'assets/images/sands_water_half_left_bottom_side.png', width: 150, height: 95}, // 9
    {src: 'assets/images/sands_water_left_half_right_bottom.png', width: 150, height: 95}, // 10
    {src: 'assets/images/sands_water_top_half.png', width: 152, height: 95}, // 11
    {src: 'assets/images/sands_water_right_half_left_bottom.png', width: 150, height: 95}, // 12
    {src: 'assets/images/sands_water_half_right_bottom_side.png', width: 150, height: 95}, // 13
    {src: 'assets/images/sands_water_bottom_half_right_top.png', width: 150, height: 95}, // 14
    {src: 'assets/images/sands_water_bottom_half.png', width: 150, height: 95}, // 15
    {src: 'assets/images/sands_water_left_half.png', width: 150, height: 94}, // 16
    {src: 'assets/images/sands_water_bottom_half2.png', width: 152, height: 95}, // 17
    {src: 'assets/images/sands_stone_2.png', width: 150, height: 95}, // 18
    {src: 'assets/images/sands_stone_2f.png', width: 150, height: 95}, // 19
    {src: 'assets/images/sands_stone_1.png', width: 150, height: 95}, // 20
    {src: 'assets/images/sands_stone_1f.png', width: 150, height: 95}, // 21
    {src: 'assets/images/sands_stone_3.png', width: 150, height: 95}, // 22
    {src: 'assets/images/palm_detailed_long_NE.png', width: 75, height: 104}, // 23
    {src: 'assets/images/palm_detailed_long_NW.png', width: 75, height: 104}, // 24
    {src: 'assets/images/palm_detailed_long_SE.png', width: 75, height: 104}, // 25
    {src: 'assets/images/palm_detailed_long_SW.png', width: 75, height: 104}, // 26
    {src: 'assets/images/palm_detailed_short_NE.png', width: 75, height: 104}, // 27
    {src: 'assets/images/palm_detailed_short_NW.png', width: 75, height: 104}, // 28
    {src: 'assets/images/palm_detailed_short_SE.png', width: 75, height: 104}, // 29
    {src: 'assets/images/palm_detailed_short_SW.png', width: 75, height: 104}, // 30
    {src: 'assets/images/palm_long_NE.png', width: 75, height: 104}, // 31
    {src: 'assets/images/palm_long_NW.png', width: 75, height: 104}, // 32
    {src: 'assets/images/palm_long_SE.png', width: 75, height: 104}, // 33
    {src: 'assets/images/palm_long_SW.png', width: 75, height: 104}, // 34
    {src: 'assets/images/tower_SE.png', width: 105, height: 134}, // 35
    {src: 'assets/images/tower_NE.png', width: 105, height: 134}, // 36
    {src: 'assets/images/tower_NW.png', width: 105, height: 134}, // 37
    {src: 'assets/images/tower_SW.png', width: 105, height: 134}, // 38
    {src: 'assets/images/ship_wreck_SW.png', width: 150, height: 120}, // 39
    {src: 'assets/images/formation_stone_NE.png', width: 150, height: 120}, // 40
    {src: 'assets/images/formationLarge_stone_SE.png', width: 65, height: 100}, // 41
    {src: 'assets/images/formationLarge_stone_SW.png', width: 65, height: 100}, // 42
    {src: 'assets/images/field_brown_512.png', width: 150, height: 75}, // 43
    {src: 'assets/images/b-4.png', width: 150, height: 150}, // 44
    {src: 'assets/images/chest_SE.png', width: 34, height: 40}, // 45
    {src: 'assets/images/bottle_SW.png', width: 10, height: 21}, // 46
    {src: 'assets/images/lily.png', width: 75, height: 35}, // 47
    {src: 'assets/images/boat_large_NW.png', width: 62, height: 45}, // 48
    {src: 'assets/images/shovel_NE.png', width: 50, height: 25}, // 49
    {src: 'assets/images/goldforge/skull_mountain_small_1.png', width: 187, height: 200}, // 50
    {src: 'assets/images/goldforge/tower.png', width: 112, height: 110}, // 51
    {src: 'assets/images/kisspng/maya_stone.png', width: 52, height: 100}, // 52
    {src: 'assets/images/kisspng/temple.png', width: 149, height: 200} // 53
  ],
  map: [ // x, map's left diagonal side to top right
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], // y, map's left diagonal side down towards bottom right
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 16, 15, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 16, 18, 19, 18, 3, 3, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 5, 5, 4, 4, 3, 2, 2, 20, 19, 14, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 5, 4, 4, 4, 3, 2, 2, 1, 3, 13, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 3, 1, 2, 2, 3, 13, 4, 4, 4, 4, 4, 5, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 18, 2, 2, 2, 3, 12, 4, 4, 4, 4, 6, 4, 4, 4, 4, 4, 4, 4],// 10
    [4, 4, 4, 4, 4, 4, 19, 1, 2, 2, 3, 3, 10, 9, 9, 7, 8, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 3, 19, 3, 19, 18, 17, 4, 4, 4, 4, 4, 4, 4], // 12
    [4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 1, 1, 2, 1, 2, 21, 3, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 3, 1, 2, 1, 2, 1, 2, 2, 1, 3, 3, 4, 4, 4, 4, 4, 4, 4], // 14
    [4, 4, 4, 4, 4, 4, 3, 43, 43, 43, 2, 2, 2, 4, 4, 3, 3, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 3, 43, 2, 2, 1, 2, 2, 2, 4, 3, 3, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 11, 3, 19, 22, 20, 3, 3, 3, 3, 18, 8, 4, 4, 4, 4, 4, 4, 4], // 17
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 4, 4],
    [4, 16, 19, 15, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 4, 4, 4, 4, 4, 5, 4, 4, 4, 4], // 20
    [4, 19, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 11, 3, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] // 23
  ],
  mapLayers: [ // x, columns (0-23)
    [ // y, rows on the x column (0-23)
      null, // row 0 on x=0
      null, // row 1
      null, // row 2 etc
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 1
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 2
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 3
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 4
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 5
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 35, offsetX: (150 - 75)/2, offsetY: 104*0.9}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 6
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 70, offsetY: 55}, {tileId: 27, offsetX: 40, offsetY: 50}, {tileId: 30, offsetX: 65, offsetY: 25}],
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 40, offsetY: 60}, {tileId: 27, offsetX: 20, offsetY: 50}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 7
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 27, offsetX: 40, offsetY: 50}, {tileId: 28, offsetX: 70, offsetY: 55}],
      [{tileId: 27, offsetX: 20, offsetY: 50}, {tileId: 28, offsetX: 40, offsetY: 60}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 8
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 60, offsetY: 65}, {tileId: 27, offsetX: 15, offsetY: 60}, {tileId: 30, offsetX: 55, offsetY: 45}],
      [{tileId: 28, offsetX: 30, offsetY: 55}, {tileId: 27, offsetX: 10, offsetY: 50}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 9
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 30, offsetY: 65}, {tileId: 27, offsetX: 0, offsetY: 60}],
      [{tileId: 50, offsetX: -50, offsetY: 105}],
      null,
      null,
      [{tileId: 48, offsetX: 35, offsetY: 0}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 10
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 60, offsetY: 65}, {tileId: 27, offsetX: 15, offsetY: 60}, {tileId: 30, offsetX: 55, offsetY: 45}],
      [{tileId: 28, offsetX: 60, offsetY: 65}, {tileId: 27, offsetX: 15, offsetY: 60}, {tileId: 30, offsetX: 55, offsetY: 45}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 11
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 60, offsetY: 65}, {tileId: 27, offsetX: 15, offsetY: 60}, {tileId: 30, offsetX: 55, offsetY: 45}],
      [{tileId: 27, offsetX: 60, offsetY: 80}, {tileId: 28, offsetX: 20, offsetY: 55}],
      [{tileId: 27, offsetX: 60, offsetY: 80}, {tileId: 28, offsetX: 20, offsetY: 55}],
      null,
      [{tileId: 28, offsetX: 30, offsetY: 85}, {tileId: 27, offsetX: 0, offsetY: 80}, {tileId: 30, offsetX: 15, offsetY: 55}, {tileId: 28, offsetX: 90, offsetY: 50}, {tileId: 27, offsetX: 50, offsetY: 40}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 12
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 70, offsetY: 65}, {tileId: 27, offsetX: 40, offsetY: 50}],
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 70, offsetY: 55}, {tileId: 27, offsetX: 40, offsetY: 50}],
      null,
      [{tileId: 38, offsetX: 0, offsetY: 70}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 13
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 27, offsetX: 40, offsetY: 50}],
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 60, offsetY: 65}, {tileId: 27, offsetX: 15, offsetY: 60}, {tileId: 30, offsetX: 55, offsetY: 45}],
      [{tileId: 23, offsetX: 40, offsetY: 75}, {tileId: 28, offsetX: 70, offsetY: 55}, {tileId: 27, offsetX: 10, offsetY: 50}],
      null,
      [{tileId: 27, offsetX: 40, offsetY: 50}],
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 14
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 30, offsetY: 85}, {tileId: 27, offsetX: 0, offsetY: 80}, {tileId: 30, offsetX: 25, offsetY: 65}, {tileId: 52, offsetX: 80, offsetY: 50}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 15
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 42, offsetX: 40, offsetY: 50}],
      null,
      [{tileId: 28, offsetX: 60, offsetY: 65}, {tileId: 27, offsetX: 15, offsetY: 60}, {tileId: 30, offsetX: 55, offsetY: 45}],
      null,
      [{tileId: 53, offsetX: 70, offsetY: 130}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 16
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 24, offsetX: 0, offsetY: 50}, {tileId: 27, offsetX: 35, offsetY: 40}],
      [{tileId: 36, offsetX: 25, offsetY: 80}],
      [{tileId: 40, offsetX: 0, offsetY: 50}],
      [{tileId: 41, offsetX: 40, offsetY: 40}],
      null,
      null,
      null,
      [{tileId: 27, offsetX: 0, offsetY: 50}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 17
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 28, offsetX: 70, offsetY: 55}, {tileId: 27, offsetX: 40, offsetY: 50}],
      null,
      null,
      null,
      [{tileId: 28, offsetX: 30, offsetY: 35}],
      [{tileId: 28, offsetX: 70, offsetY: 35}, {tileId: 27, offsetX: 40, offsetY: 30}],
      [{tileId: 28, offsetX: 30, offsetY: 55}, {tileId: 27, offsetX: 0, offsetY: 50}, {tileId: 30, offsetX: 25, offsetY: 35}],
      [{tileId: 28, offsetX: 30, offsetY: 55}],
      null,
      [{tileId: 28, offsetX: 30, offsetY: 55}, {tileId: 27, offsetX: 0, offsetY: 50}, {tileId: 30, offsetX: 25, offsetY: 35}],
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 18
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 47, offsetX: 30, offsetY: -20}],
      null,
      null,
      null
    ],
    [ // 19
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [{tileId: 47, offsetX: 50, offsetY: -30}],
      [{tileId: 47, offsetX: 30, offsetY: -20}],
      [{tileId: 39, offsetX: 45, offsetY: 80}],
      null,
      null
    ],
    [ // 20
      null,
      [{tileId: 24, offsetX: 60, offsetY: 60}, {tileId: 27, offsetX: 95, offsetY: 55}],
      null,
      [{tileId: 45, offsetX: 35, offsetY: 0}, {tileId: 46, offsetX: 70, offsetY: -25}, {tileId: 49, offsetX: 70, offsetY: -15}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 21
      null,
      null,
      [{tileId: 23, offsetX: (150 - 75)/2, offsetY: 104*0.7}, {tileId: 28, offsetX: 70, offsetY: 55}, {tileId: 27, offsetX: 10, offsetY: 50}],
      [{tileId: 28, offsetX: 70, offsetY: 55}, {tileId: 27, offsetX: 40, offsetY: 50}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 22
      null,
      null,
      [{tileId: 24, offsetX: 30, offsetY: 35}],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    [ // 23
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ]
  ],
  areTileLayersNextTo: (xI, yI) => { /* Map specific drawing logic for enemy ships*/
    let layersExist = false;

    if (MapData.mapLayers[xI][(yI < 23 ? yI + 1 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[xI][(yI < 22 ? yI + 2 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI < 23 ? xI + 1 : xI)][(yI < 23 ? yI + 1 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI < 23 ? xI + 1 : xI)][(yI < 22 ? yI + 2 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI < 22 ? xI + 2 : xI)][(yI < 23 ? yI + 1 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI < 22 ? xI + 2 : xI)][(yI < 22 ? yI + 2 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI > 0 ? xI - 1 : xI)][yI] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI > 1 ? xI - 2 : xI)][yI] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI > 0 ? xI - 1 : xI)][(yI < 23 ? yI + 1 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI > 0 ? xI - 1 : xI)][(yI < 22 ? yI + 2 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI > 1 ? xI - 2 : xI)][(yI < 23 ? yI + 1 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI > 1 ? xI - 2 : xI)][(yI < 22 ? yI + 2 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI > 2 ? xI - 3 : xI)][(yI < 23 ? yI + 1 : yI)] !== null) {
      layersExist = true;
    } else if (MapData.mapLayers[(xI > 2 ? xI - 3 : xI)][(yI < 22 ? yI + 2 : yI)] !== null) {
      layersExist = true;
    }

    return layersExist;
  }
};

export {MapData};
