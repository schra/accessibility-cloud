import { Meteor } from 'meteor/meteor';
import { EquipmentInfos } from '../equipment-infos';
import ensureTileCoordinatesIndexOnCollection
  from '../../shared/tile-indexing/ensureTileCoordinatesIndexOnCollection';

Meteor.startup(() => {
  EquipmentInfos._ensureIndex({ 'properties.sourceId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.sourceImportId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.originalId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.sourceId': 1, 'properties.originalId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.placeSourceId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.placeInfoId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.category': 1 });
  EquipmentInfos._ensureIndex({ 'properties.originalPlaceInfoId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.sourceName': 1 });
  EquipmentInfos._ensureIndex({ 'properties.organizationName': 1 });
  
  console.log('Ensuring geospatial index for EquipmentInfos...');
  EquipmentInfos._ensureIndex({ geometry: '2dsphere' });
  ensureTileCoordinatesIndexOnCollection(EquipmentInfos);
});
