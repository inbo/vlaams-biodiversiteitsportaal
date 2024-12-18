# Sensitive-data

A running WiP doc to note down some of the ideas regarding sensitive data in the portal

## Examples of other people doing this with solr data
https://doc.sitecore.com/xp/en/developers/latest/sitecore-experience-manager/use-permissions-for-search.html#use-permissions-when-you-search-from-the-api

## Approaches
### Duplicate Solr collections

Simply run two instances of the solr collection, one for sensitive data and one for non-sensitive data.  
The biocache-service with sensitive data would simply required an additional role, which is easy to do with the current config.

Data ingestion could run as normal without any changes to ingest all data including sensitive data into the sensitive collection.
Next we would simply duplicate the data from the sensitive collection to the non-sensitive collection, but with the sensitive fields removed or changed.

The biocache-service would then simply be configured to select the correct solr-index based on the role of the current user.

Pros:`
- Minimal changes to the current code, only biocache-service needs to be modified and some post-processing to duplicate the Solr collections is needed.
- Queries work on both sensitive and non-sensitive data, no need for the user to explicitly choose which.

Cons:
- Duplicate Solr indexes can be very expensive in terms of storage.
- Access control is very coarse grained, either all or nothing.


### Modify the sensitive-data-service

Use the pipeline as is, but modify the sensitive data service to also retain the original high resolution sensitive data so it can be used in queries.


#### How to query the data?
##### 1. Switch using a button

User clicks a button, switches to querying sensitive data. Queries are modified to run on different fields?

But that means we cannot query both sensitive and non-sensitive data at the same time.

##### 2. Add a field to all records

Maybe we can add a single field to all solr records with a list of roles of the user that is allowed to see the record.
That way we can have many different roles that are allowed to access different datasets.

This field is then used in all queries to filter out records that the user is not allowed to see.

So for a sensitive record we would have distinct items in the Solr index:  
So a normal / non-authenticated user includes a facet: `role: unauthenticaed, authenticated, some-other-role`
An ANB user includes a facet: `role: anb, yet-another-role`

a non-sensitive records would simply include all roles.
But that does mean a user is only allowed a single role :( 


The same record could then be duplicated in the solr index for the different roles.


above does not really work.
But I think we can make it work if we have an access role field that is either:
- not-existent/empty: all users can always see the record
- contains a single role that allows to see the record at high-resolution on a record containing duplicate data.
   a duplicate record is made with low-resolution date, but with that same role negated. (or a separate boolean field sensitive false and the same role in the role field or something)

That way everyone always sees all the data, users can have multiple roles, and no one will see any duplicated.
But it is important that access to a record is only controlled by a single role.
  

Then we can simply filter out records that do not have the current user's role in the access role field.


### Use custom fields in the dwc archive

This is the French approach.
Would require preprocessing of the archives before presenting it to the pipeline
But entails similar issues as the sensitive-data-service approach?


