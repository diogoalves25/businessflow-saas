import { useBusiness } from '@/src/contexts/BusinessContext';

export function useServices() {
  const { businessType, template } = useBusiness();
  
  return {
    services: template.services,
    businessType,
    teamMemberTitle: template.teamMemberTitle,
    teamMemberPluralTitle: template.teamMemberPluralTitle,
  };
}