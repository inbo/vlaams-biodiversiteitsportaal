update profiles set value = 'ACT' where property = 'state' and value = 'Australian Capital Territory';
update profiles set value = 'NSW' where property = 'state' and value = 'New South Wales';
update profiles set value = 'NT' where property = 'state' and value = 'Northern Territory';
update profiles set value = 'QLD' where property = 'state' and value = 'Queensland';
update profiles set value = 'SA' where property = 'state' and value = 'South Australia';
update profiles set value = 'TAS' where property = 'state' and value = 'Tasmania';
update profiles set value = 'VIC' where property = 'state' and value = 'Victoria';
update profiles set value = 'WA' where property = 'state' and value = 'Western Australia';
update profiles set value = '' where property = 'state' and value = 'N/A';
update profiles set value = '' where property = 'state' and value = 'Select State';

insert into profiles (userid, property, value) select userid, 'country', 'AU' from profiles where property = 'state' and `value` IN ('ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA');
insert into profiles (userid, property, value) select userid, 'country', 'US' from profiles where property = 'state' and `value` IN ('CT', 'PA');
insert into profiles (userid, property, value) select userid, 'country', '' from profiles where property = 'state' and `value` NOT IN ('ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'CT', 'PA');

