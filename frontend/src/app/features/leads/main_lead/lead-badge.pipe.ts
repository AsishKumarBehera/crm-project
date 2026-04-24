import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadBadge',
  standalone: true,
})
export class LeadBadgePipe implements PipeTransform {
  transform(value: string): string {
    const map: Record<string, string> = {
      New:        'lead__badge--new',
      Contacted:  'lead__badge--contacted',
      Qualified:  'lead__badge--qualified',
      Proposal:   'lead__badge--proposal',
      Closed:     'lead__badge--closed',
      Active:     'lead__badge--active',
      Inactive:   'lead__badge--inactive',
      Pending:    'lead__badge--pending',
    };
    return map[value] ?? 'lead__badge--default';
  }
}