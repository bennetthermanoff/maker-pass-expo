//parse the group name and location from the group name, location is in parentheses
//example: parseGroupName('Group 1 (Location 1)') => ['Group 1', 'Location 1']
//example: parseGroupName('Group 1') => ['Group 1', '']
//example: parseGroupName('(Location 1) Group 1') => ['Group 1', 'Location 1']
export const parseGroupName = (groupName: string) => {
    const locationMatch = groupName.match(/\(([^)]+)\)/);
    const location = locationMatch ? locationMatch[1] : '';
    const group = groupName.replace(locationMatch ? locationMatch[0] : '', '').trim();
    return [group, location];
};