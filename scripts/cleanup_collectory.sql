-- Removes all collectory DataResources that have were created by the species-list service, but no longer have a corresponding species-list
DELETE
FROM collectory.data_resource dr
WHERE dr.resource_type = 'species-list'
  AND dr.user_last_modified = 'Species list upload'
  AND dr.uid NOT IN (SELECT data_resource_uid FROM specieslists.species_list)
