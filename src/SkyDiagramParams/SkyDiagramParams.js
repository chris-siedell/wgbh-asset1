/*
SkyDiagramParams.js
wgbh-asset1
astro.unl.edu
2019-06-19
*/


import MoonImageURL from './graphics/Boston1_v8_moon.svg';
import SunImageURL from './graphics/sun.svg';
import GroundImageURL from './graphics/Boston1_v8_ground.svg';

import ForegroundImage_1_URL from './graphics/Boston1_v8_tree.svg';
import ForegroundImage_2_URL from './graphics/Boston1_v8_house_nolamp.svg';
import ForegroundImage_3_URL from './graphics/lamp-pane-off.svg';
import ForegroundImage_4_URL from './graphics/lamp-pane-on.svg';
import ForegroundImage_5_URL from './graphics/lamp-frame.svg';
import ForegroundImage_6_URL from './graphics/Boston1_v8_swings.svg';
import ForegroundImage_7_URL from './graphics/playground_curlyslide.svg';
import ForegroundImage_8_URL from './graphics/playground_sandbox.svg';


export var SkyDiagramParams = {
 "width": 836,
 "height": 736,
 "horizon": 0.14999999999999997,
 "peak": 0.7150000000000002,
 "margin": 0.02999999999999999,
 "showTrack": true,
 "trackColor": "#ffffff",
 "trackWidth": 0.5,
 "trackCutoutSize": 1.2,
 "sunPosition": 0.4,
 "sunSize": 0.05,
 "sunNoImageColor": "#fbd449",
 "moonPosition": 0.2,
 "moonSize": 0.05,
 "moonNoImageColor": "#e0e0e0",
 "dayTopColor": "#155ac7",
 "dayBottomColor": "#29abe2",
 "nightTopColor": "#030305",
 "nightBottomColor": "#323052",
 "skyTransitionBelowThreshold": 0.15,
 "skyTransitionAboveThreshold": 0.05,
 "skyLevelTransitionPower": 2,
 "darkestShadingLevel": 0.5,
 "shadingLevelTransitionPower": 3,
 "trackPath": [
  {
   "x": 0.3579999999999999,
   "y": 1
  }
 ],
 "sunImageSrc": SunImageURL,
 "moonImageSrc": MoonImageURL,
 "groundImageSrc": GroundImageURL,
 "foregroundObjects": [
  {
   "ID": "tree",
   "params": {
    "system": "horizon",
    "x": 0.23000000000000007,
    "y": -0.45000000000000023,
    "offsetX": 0.5,
    "offsetY": 1,
    "width": 0.11600000000000002,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_1_URL,
    "aspectRatio": 0.8571428571428571,
    "visibility": {},
    "refObjectID": "",
    "imageName": "tree"
   }
  },
  {
   "ID": "house",
   "params": {
    "system": "horizon",
    "x": 0.76,
    "y": -0.2300000000000003,
    "offsetX": 0.5,
    "offsetY": 1,
    "width": 0.148,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_2_URL,
    "aspectRatio": 1.1538461538461537,
    "visibility": {},
    "refObjectID": "",
    "imageName": "house"
   }
  },
  {
   "ID": "lamp-pane-off",
   "params": {
    "system": "object",
    "x": 0.5,
    "y": 0.2,
    "offsetX": 0.5,
    "offsetY": 0,
    "width": 0.4,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_3_URL,
    "aspectRatio": 2,
    "visibility": {},
    "refObjectID": "house",
    "imageName": "lamp pane off"
   }
  },
  {
   "ID": "lamp-pane-on",
   "params": {
    "system": "object",
    "x": 0.5,
    "y": 0.2,
    "offsetX": 0.5,
    "offsetY": 0,
    "width": 0.4,
    "applyNightShading": false,
    "imageSrc": ForegroundImage_4_URL,
    "aspectRatio": 2,
    "visibility": {
     "sunPosition": [
      {
       "begin": 0.5,
       "end": 0
      }
     ]
    },
    "refObjectID": "house",
    "imageName": "lamp pane on"
   }
  },
  {
   "ID": "lamp-frame",
   "params": {
    "system": "object",
    "x": 0.5,
    "y": 0.2,
    "offsetX": 0.5,
    "offsetY": 0,
    "width": 0.4,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_5_URL,
    "aspectRatio": 2,
    "visibility": {},
    "refObjectID": "house",
    "imageName": "lamp frame"
   }
  },
  {
   "ID": "e03c9258-65e5-4c15-86c0-9a482bca2bd7",
   "params": {
    "system": "horizon",
    "x": 0.4500000000000002,
    "y": -0.5,
    "offsetX": 0,
    "offsetY": 0.3600000000000001,
    "width": 0.12000000000000002,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_6_URL,
    "aspectRatio": 1,
    "visibility": {},
    "refObjectID": "",
    "imageName": "Boston1_v8_swings.svg"
   }
  },
  {
   "ID": "5a4283d9-67be-4c99-b72f-d78ab1e06641",
   "params": {
    "system": "horizon",
    "x": 0.31000000000000005,
    "y": -0.32999999999999985,
    "offsetX": 0,
    "offsetY": 0.33000000000000007,
    "width": 0.12000000000000002,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_7_URL,
    "aspectRatio": 1,
    "visibility": {},
    "refObjectID": "",
    "imageName": "playground_curlyslide.svg"
   }
  },
  {
   "ID": "cbb4df77-9ffc-4401-8537-b0d12bcd27db",
   "params": {
    "system": "horizon",
    "x": 0.5800000000000002,
    "y": -0.18000000000000008,
    "offsetX": 0,
    "offsetY": 0,
    "width": 0.086,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_8_URL,
    "aspectRatio": 1,
    "visibility": {},
    "refObjectID": "",
    "imageName": "playground_sandbox.svg"
   }
  }
 ]
};


