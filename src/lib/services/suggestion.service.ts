import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormControlService } from '../../dynamic-catalogue/services/form-control.service';
import { SurveyComponent } from '../../dynamic-catalogue/pages/dynamic-form/survey.component';
import { Model } from '../../dynamic-catalogue/domain/dynamic-form-model';
import { Vocabulary } from '../domain/eic-model';

// ── Interfaces ───────────────────────────────────────────────────────────────

/**
 * Describes a single suggestable field within a form's config.
 * Each entry maps one API field to how it should be displayed in the modal
 * and how it should be written back into the dynamic form.
 */
export interface SuggestionFieldConfig {
  fieldName: string;          // matches the API's field_name e.g. 'scientific_domains', 'tags'
  label: string;              // human-readable label shown as section header in the modal
  type: 'checkbox' | 'radio'; // radio for single-value fields, checkbox for multi-value
  vocabularyType?: string;    // Type.SCIENTIFIC_SUBDOMAIN etc. — omit for free-text fields like tags
  isComposite?: boolean;      // true for fields with a parent/child structure (scientificDomains, categories)
  formArrayName?: string;     // the FormArray or FormControl name in the dynamic form
  parentLookupField?: string; // for composite fields: the parent form control name e.g. 'scientificDomain'
  childField?: string;        // for composite fields: the child form control name e.g. 'scientificSubdomain'
}

/**
 * Configuration object that each form component defines.
 * This is the only thing that differs between the 8 resource forms.
 * The service reads this to know what to request from the API and
 * how to write the results back into the form.
 */
export interface SuggestionConfig {
  resourceType: string;          // sent to the API e.g. 'service', 'datasource'
  formKey: string;               // key used in child.form — must be lowercase e.g. 'service'
  fields: SuggestionFieldConfig[]; // one entry per suggestable field
}

/**
 * Tracks which suggestions the user has checked in the modal.
 * Keyed by fieldName. Value is string[] for checkboxes, string|null for radio.
 * Reset every time the modal is opened fresh.
 */
export interface SuggestionSelections {
  [fieldName: string]: string | string[] | null;
}

/**
 * A single rendered section in the modal (one per field the API returned suggestions for).
 * Built dynamically from the API response — only fields with actual suggestions get a section.
 */
export interface SuggestionSection {
  fieldName: string;              // the API field_name, used to key into selections
  label: string;                  // section header shown in the modal
  type: 'checkbox' | 'radio';
  items: { id: string; name: string }[]; // the items to show as checkboxes/radios
}

/**
 * Everything the modal needs to render itself.
 * Lives in the form component as a single flat object.
 * Updated by the service via the onDone callback in fetchSuggestions.
 */
export interface SuggestionState {
  noSuggestionsCall: boolean | null; // null = not yet opened; true = name/description were empty
  showLoader: boolean;               // true while API call is in flight
  emptySuggestionResponse: boolean;  // true if API returned no usable suggestions
  sections: SuggestionSection[];     // dynamic sections to render in the modal
  selections: SuggestionSelections;  // what the user has checked so far
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SuggestionService {

  constructor(private http: HttpClient) {}

  /**
   * Returns a blank SuggestionState.
   * Call this in the form component's field initializer so the modal
   * has safe empty defaults before any API call is made.
   */
  getInitialState(): SuggestionState {
    return {
      noSuggestionsCall: null,
      showLoader: false,
      emptySuggestionResponse: false,
      sections: [],
      selections: {}
    };
  }

  /**
   * Reads name and description from the dynamic form, calls the suggestions API,
   * then builds a dynamic list of sections from the response for the modal to render.
   *
   * Called from showSuggestionsModal() in the form component.
   * The modal is opened inside the onDone callback (not before) to ensure
   * the state is set before UIkit renders the modal content.
   *
   * @param config        - the form's resource type, form key, and field definitions
   * @param childForm     - this.child.form from the form component (SurveyComponent's FormGroup)
   * @param vocabularies  - the full vocabulary map already loaded in the form component
   * @param state         - current suggestion state (used as base for updates)
   * @param onDone        - callback that receives the new state; open the modal inside this
   */
  fetchSuggestions(
    config: SuggestionConfig,
    childForm: UntypedFormGroup,
    vocabularies: Map<string, Vocabulary[]>,
    state: SuggestionState,
    onDone: (state: SuggestionState) => void
  ) {
    // Navigate into the correct section of the dynamic form using the form key
    const serviceForm = childForm.get(config.formKey) as UntypedFormGroup;
    const name = serviceForm?.get('name')?.value;

    // Strip HTML tags produced by CKEditor (rich text wraps content in <p> tags)
    const rawDescription = serviceForm?.get('description')?.value;
    const description = rawDescription ? rawDescription.replace(/<[^>]*>/g, '').trim() : null;

    // Do not call the API if both fields are empty — show a message in the modal instead
    if (!name && !description) {
      onDone({ ...state, noSuggestionsCall: true });
      return;
    }

    // Signal the modal to show a spinner while the API call is in flight
    onDone({ ...state, noSuggestionsCall: false, showLoader: true });

    // Build the fields_to_suggest array from the config
    const fieldsToSuggest = config.fields.map(f => f.fieldName);

    this.http.post<any[]>('/v1/auto_completion/suggest', {
      resource_type: config.resourceType,
      resource: { name, description },
      fields_to_suggest: fieldsToSuggest,
      maximum_suggestions: 5
    }).subscribe({
      next: (res: any[]) => {
        // Build sections dynamically — one per field that the API returned suggestions for.
        // Fields with no suggestions are silently skipped, so the modal only shows
        // what's actually useful. This also means different resource types automatically
        // get different sections without any HTML changes.
        const sections: SuggestionSection[] = [];

        for (const fieldConfig of config.fields) {
          const apiEntry = res.find(i => i.field_name === fieldConfig.fieldName);
          if (!apiEntry?.suggestions?.length) continue;

          let items: { id: string; name: string }[] = [];

          if (fieldConfig.vocabularyType) {
            // Vocabulary field: match suggestion IDs against the local vocabulary
            // to get human-readable names for display in the modal
            items = (vocabularies[fieldConfig.vocabularyType] || [])
              .filter(v => apiEntry.suggestions.includes(v.id))
              .map(v => ({ id: v.id, name: v.name }));
          } else {
            // Free-text field (e.g. tags): use the raw strings as both id and display name
            items = apiEntry.suggestions.map((s: string) => ({ id: s, name: s }));
          }

          if (items.length > 0) {
            sections.push({
              fieldName: fieldConfig.fieldName,
              label: fieldConfig.label,
              type: fieldConfig.type,
              items
            });
          }
        }

        const newState: SuggestionState = {
          ...state,
          noSuggestionsCall: false,
          showLoader: false,
          selections: this.resetSelections(config),
          sections,
          emptySuggestionResponse: sections.length === 0
        };

        onDone(newState);
      },
      error: (err) => {
        console.error(err);
        onDone({ ...state, showLoader: false });
      }
    });
  }

  /**
   * Applies the user's checked selections to the actual dynamic form.
   *
   * Three cases handled:
   * - Composite fields (scientificDomains, categories): parent ID is looked up from
   *   vocabulary and both parent + child controls are set on a new FormGroup
   * - Radio fields (orderType, jurisdiction etc.): single value set directly on the control
   * - Flat array fields (accessTypes, tags etc.): values pushed into a FormArray
   *
   * For all array fields, an empty placeholder row (added by the dynamic form on init)
   * is removed before appending the new values.
   *
   * Uses getModelData() + createField() from the dynamic form's own service
   * to ensure new controls match the structure and validators the form expects.
   *
   * @param config             - the form's resource type, form key, and field definitions
   * @param childForm          - this.child.form from the form component
   * @param state              - current suggestion state (reads selections from here)
   * @param vocabularies       - needed to look up parentId for composite fields
   * @param surveyChild        - this.child (the SurveyComponent ViewChild reference)
   * @param dynamicFormService - FormControlService used to create new form controls
   * @param model              - the form model JSON, needed by getModelData()
   */
  autocomplete(
    config: SuggestionConfig,
    childForm: UntypedFormGroup,
    state: SuggestionState,
    vocabularies: Map<string, Vocabulary[]>,
    surveyChild: SurveyComponent,
    dynamicFormService: FormControlService,
    model: Model
  ) {
    const serviceForm = childForm.get(config.formKey) as UntypedFormGroup;

    for (const fieldConfig of config.fields) {
      const selected = state.selections[fieldConfig.fieldName];

      // Skip fields the user made no selections for
      if (!selected || (Array.isArray(selected) && selected.length === 0)) continue;

      const selectedIds = Array.isArray(selected) ? selected : [selected];
      const formArrayName = fieldConfig.formArrayName ?? fieldConfig.fieldName;

      if (fieldConfig.isComposite) {
        // Composite field: each selected item needs its parent ID looked up from vocabulary.
        // A new FormGroup is created for each pair (parent + child) and pushed into the array.
        const formArray = serviceForm.get(formArrayName) as UntypedFormArray;

        // Remove the empty placeholder row the dynamic form initializes with
        if (formArray.length === 1 && !formArray.at(0).get(fieldConfig.parentLookupField)?.value) {
          formArray.removeAt(0);
        }

        for (const id of selectedIds) {
          const parentId = (vocabularies[fieldConfig.vocabularyType] || [])
            .find(v => v.id === id)?.parentId;
          if (parentId) {
            // Use the dynamic form's own factory so validators and structure match
            const field = surveyChild.getModelData(model.sections, formArrayName);
            const group = dynamicFormService.createField(field) as UntypedFormGroup;
            group.get(fieldConfig.parentLookupField)?.setValue(parentId);
            group.get(fieldConfig.childField)?.setValue(id);
            formArray.push(group);
          }
        }

      } else if (fieldConfig.type === 'radio') {
        // Single-value field — set the value directly on the form control
        serviceForm.get(formArrayName)?.setValue(selectedIds[0]);

      } else {
        // Flat array field (accessTypes, tags etc.)
        const formArray = serviceForm.get(formArrayName) as UntypedFormArray;

        // Remove the empty placeholder row the dynamic form initializes with
        if (formArray.length === 1 && !formArray.at(0).value) {
          formArray.removeAt(0);
        }

        for (const id of selectedIds) {
          const field = surveyChild.getModelData(model.sections, formArrayName);
          const ctrl = dynamicFormService.createField(field);
          ctrl.setValue(id);
          console.log(ctrl);
          formArray.push(ctrl);
        }
      }
    }
  }

  /**
   * Called every time a checkbox or radio changes in the modal.
   * Returns a new selections object — does not mutate the existing one.
   *
   * @param state     - current state (to read existing selections from)
   * @param fieldName - the API field_name of the section e.g. 'scientific_domains'
   * @param value     - the vocabulary ID or tag string of the item that changed
   * @param checked   - whether it was just checked or unchecked
   * @param type      - 'checkbox' or 'radio', determines single vs multi selection behavior
   */
  toggleSelection(
    state: SuggestionState,
    fieldName: string,
    value: string,
    checked: boolean,
    type: 'checkbox' | 'radio'
  ): SuggestionSelections {
    const selections = { ...state.selections };

    if (type === 'radio') {
      // Radio: only one value allowed — set or clear
      selections[fieldName] = checked ? value : null;
    } else {
      // Checkbox: maintain an array of selected values
      const current = (selections[fieldName] as string[]) || [];
      if (checked) {
        selections[fieldName] = [...current, value];
      } else {
        selections[fieldName] = current.filter(v => v !== value);
      }
    }

    return selections;
  }

  /**
   * Returns a blank selections object with correct initial value per field type.
   * Used internally after a fresh API call to clear any previous selections.
   */
  private resetSelections(config: SuggestionConfig): SuggestionSelections {
    const selections: SuggestionSelections = {};
    for (const field of config.fields) {
      selections[field.fieldName] = field.type === 'radio' ? null : [];
    }
    return selections;
  }
}
