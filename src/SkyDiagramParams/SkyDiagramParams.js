/*
SkyDiagramParams.js
wgbh-asset1
astro.unl.edu
2019-08-12
*/


import MoonImageURL from './graphics/Boston1_v8_moon.svg';
import SunImageURL from './graphics/sun-fixed.svg';
import GroundImageURL from './graphics/Boston1_v8_ground-fixed.svg';

import ForegroundImage_1_URL from './graphics/Boston1_v8_tree-fixed.svg';
import ForegroundImage_2_URL from './graphics/Boston1_v8_house_nolamp.svg';
import ForegroundImage_3_URL from './graphics/lamp-pane-off.svg';
import ForegroundImage_4_URL from './graphics/lamp-pane-on.svg';
import ForegroundImage_5_URL from './graphics/lamp-frame.svg';
import ForegroundImage_6_URL from './graphics/Boston1_v8_swings-fixed.svg';
import ForegroundImage_7_URL from './graphics/playground_curlyslide-fixed.svg';
import ForegroundImage_8_URL from './graphics/playground_sandbox-fixed.svg';


export var SkyDiagramParams = {
 "horizon": 0.14999999999999997,
 "peak": 0.7150000000000002,
 "margin": 0.02999999999999999,
 "showTrack": false,
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
 "groundImageWidth": 800,
 "groundImageHeight": 70,
 "foregroundObjects": [
  {
   "ID": "tree",
   "params": {
    "system": "horizon",
    "x": 0.23000000000000007,
    "y": -0.45000000000000023,
    "offsetX": 0.5,
    "offsetY": 1,
    "width": 0.11,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_1_URL,
    "aspectRatio": 0.828,
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
    "width": 0.135,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_2_URL,
    "aspectRatio": 1.066,
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
    "x": 0.45,
    "y": 0.25,
    "offsetX": 0,
    "offsetY": 1,
    "width": 0.12,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_6_URL,
    "aspectRatio": 1.619,
    "visibility": {},
    "refObjectID": "",
    "imageName": "Boston1_v8_swings.svg"
   }
  },
  {
   "ID": "5a4283d9-67be-4c99-b72f-d78ab1e06641",
   "params": {
    "system": "horizon",
    "x": 0.32,
    "y": 0.73,
    "offsetX": 0,
    "offsetY": 1,
    "width": 0.10,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_7_URL,
    "aspectRatio": 0.850,
    "visibility": {},
    "refObjectID": "",
    "imageName": "playground_curlyslide.svg"
   }
  },
  {
   "ID": "cbb4df77-9ffc-4401-8537-b0d12bcd27db",
   "params": {
    "system": "horizon",
    "x": 0.58,
    "y": 0.65,
    "offsetX": 0,
    "offsetY": 1,
    "width": 0.086,
    "applyNightShading": true,
    "imageSrc": ForegroundImage_8_URL,
    "aspectRatio": 2.425,
    "visibility": {},
    "refObjectID": "",
    "imageName": "playground_sandbox.svg"
   }
  }
 ]
};


