export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: 'admin' | 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role?: 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          org_id: string
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          birth_date: string | null
          gender: string | null
          country: string | null
          state: string | null
          city: string | null
          status: 'active' | 'bounced' | 'unsubscribed'
          source: string | null
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          birth_date?: string | null
          gender?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          status?: 'active' | 'bounced' | 'unsubscribed'
          source?: string | null
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          birth_date?: string | null
          gender?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          status?: 'active' | 'bounced' | 'unsubscribed'
          source?: string | null
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      custom_fields: {
        Row: {
          id: string
          org_id: string
          name: string
          type: 'text' | 'number' | 'boolean' | 'date'
          tag: string | null
          objective: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          type: 'text' | 'number' | 'boolean' | 'date'
          tag?: string | null
          objective?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          type?: 'text' | 'number' | 'boolean' | 'date'
          tag?: string | null
          objective?: string | null
          created_at?: string
        }
      }
      contact_custom_values: {
        Row: {
          id: string
          contact_id: string
          field_id: string
          value_text: string | null
          value_number: number | null
          value_date: string | null
          value_boolean: boolean | null
        }
        Insert: {
          id?: string
          contact_id: string
          field_id: string
          value_text?: string | null
          value_number?: number | null
          value_date?: string | null
          value_boolean?: boolean | null
        }
        Update: {
          id?: string
          contact_id?: string
          field_id?: string
          value_text?: string | null
          value_number?: number | null
          value_date?: string | null
          value_boolean?: boolean | null
        }
      }
      tags: {
        Row: {
          id: string
          org_id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          contact_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      lists: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          url: string | null
          subscriber_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          url?: string | null
          subscriber_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          url?: string | null
          subscriber_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      list_subscriptions: {
        Row: {
          id: string
          contact_id: string
          list_id: string
          status: 'subscribed' | 'unsubscribed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          list_id: string
          status?: 'subscribed' | 'unsubscribed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          list_id?: string
          status?: 'subscribed' | 'unsubscribed'
          created_at?: string
          updated_at?: string
        }
      }
      segments: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          type: 'dynamic' | 'static'
          global_operator: 'and' | 'or'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          type?: 'dynamic' | 'static'
          global_operator?: 'and' | 'or'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          type?: 'dynamic' | 'static'
          global_operator?: 'and' | 'or'
          created_at?: string
          updated_at?: string
        }
      }
      segment_rules: {
        Row: {
          id: string
          segment_id: string
          group_index: number
          group_operator: 'and' | 'or'
          field: string
          operator: string
          value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          segment_id: string
          group_index?: number
          group_operator?: 'and' | 'or'
          field: string
          operator: string
          value?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          segment_id?: string
          group_index?: number
          group_operator?: 'and' | 'or'
          field?: string
          operator?: string
          value?: string | null
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          org_id: string
          name: string
          price: number
          type: 'online' | 'presencial' | 'hibrido'
          sku: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          price?: number
          type?: 'online' | 'presencial' | 'hibrido'
          sku?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          price?: number
          type?: 'online' | 'presencial' | 'hibrido'
          sku?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          org_id: string
          contact_id: string
          course_id: string
          status: 'active' | 'completed' | 'dropped'
          progress: number
          enrolled_at: string | null
          completed_at: string | null
          certificate_issued: boolean
          certificate_issued_at: string | null
          last_accessed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          contact_id: string
          course_id: string
          status?: 'active' | 'completed' | 'dropped'
          progress?: number
          enrolled_at?: string | null
          completed_at?: string | null
          certificate_issued?: boolean
          certificate_issued_at?: string | null
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          contact_id?: string
          course_id?: string
          status?: 'active' | 'completed' | 'dropped'
          progress?: number
          enrolled_at?: string | null
          completed_at?: string | null
          certificate_issued?: boolean
          certificate_issued_at?: string | null
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          org_id: string
          contact_id: string
          product_type: 'course' | 'subscription' | 'certificate' | 'other'
          product_name: string
          amount: number
          sku: string | null
          status: 'paid' | 'refunded' | 'failed'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          contact_id: string
          product_type: 'course' | 'subscription' | 'certificate' | 'other'
          product_name: string
          amount: number
          sku?: string | null
          status?: 'paid' | 'refunded' | 'failed'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          contact_id?: string
          product_type?: 'course' | 'subscription' | 'certificate' | 'other'
          product_name?: string
          amount?: number
          sku?: string | null
          status?: 'paid' | 'refunded' | 'failed'
          paid_at?: string | null
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          org_id: string
          name: string
          subject: string | null
          preview_text: string | null
          from_name: string | null
          from_email: string | null
          reply_to: string | null
          status: 'draft' | 'sending' | 'sent' | 'scheduled' | 'archived'
          html_content: string | null
          target_list: string | null
          send_type: 'immediate' | 'scheduled'
          scheduled_at: string | null
          sent_at: string | null
          timezone_mode: string | null
          late_timezone_behavior: string | null
          determine_recipients_at_send: boolean
          sent_count: number
          open_count: number
          click_count: number
          bounce_count: number
          spam_count: number
          unsubscribe_count: number
          conversions: number
          revenue: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          subject?: string | null
          preview_text?: string | null
          from_name?: string | null
          from_email?: string | null
          reply_to?: string | null
          status?: 'draft' | 'sending' | 'sent' | 'scheduled' | 'archived'
          html_content?: string | null
          target_list?: string | null
          send_type?: 'immediate' | 'scheduled'
          scheduled_at?: string | null
          sent_at?: string | null
          timezone_mode?: string | null
          late_timezone_behavior?: string | null
          determine_recipients_at_send?: boolean
          sent_count?: number
          open_count?: number
          click_count?: number
          bounce_count?: number
          spam_count?: number
          unsubscribe_count?: number
          conversions?: number
          revenue?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          subject?: string | null
          preview_text?: string | null
          from_name?: string | null
          from_email?: string | null
          reply_to?: string | null
          status?: 'draft' | 'sending' | 'sent' | 'scheduled' | 'archived'
          html_content?: string | null
          target_list?: string | null
          send_type?: 'immediate' | 'scheduled'
          scheduled_at?: string | null
          sent_at?: string | null
          timezone_mode?: string | null
          late_timezone_behavior?: string | null
          determine_recipients_at_send?: boolean
          sent_count?: number
          open_count?: number
          click_count?: number
          bounce_count?: number
          spam_count?: number
          unsubscribe_count?: number
          conversions?: number
          revenue?: number
          created_at?: string
          updated_at?: string
        }
      }
      campaign_segments: {
        Row: {
          id: string
          campaign_id: string
          segment_id: string
          type: 'include' | 'exclude'
        }
        Insert: {
          id?: string
          campaign_id: string
          segment_id: string
          type: 'include' | 'exclude'
        }
        Update: {
          id?: string
          campaign_id?: string
          segment_id?: string
          type?: 'include' | 'exclude'
        }
      }
      flows: {
        Row: {
          id: string
          org_id: string
          name: string
          status: 'draft' | 'active' | 'paused'
          flow_type: 'automation' | 'transactional' | 'system'
          trigger_type: string | null
          trigger_metric: string | null
          trigger_filters: Json | null
          profile_filters: Json | null
          re_entry_mode: 'no_reentry' | 'allow_reentry' | 'reentry_after_period'
          re_entry_period_value: number | null
          re_entry_period_unit: string | null
          exit_conditions: Json | null
          active_contacts: number
          finished_contacts: number
          certificates_issued: number
          revenue: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          status?: 'draft' | 'active' | 'paused'
          flow_type?: 'automation' | 'transactional' | 'system'
          trigger_type?: string | null
          trigger_metric?: string | null
          trigger_filters?: Json | null
          profile_filters?: Json | null
          re_entry_mode?: 'no_reentry' | 'allow_reentry' | 'reentry_after_period'
          re_entry_period_value?: number | null
          re_entry_period_unit?: string | null
          exit_conditions?: Json | null
          active_contacts?: number
          finished_contacts?: number
          certificates_issued?: number
          revenue?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          status?: 'draft' | 'active' | 'paused'
          flow_type?: 'automation' | 'transactional' | 'system'
          trigger_type?: string | null
          trigger_metric?: string | null
          trigger_filters?: Json | null
          profile_filters?: Json | null
          re_entry_mode?: 'no_reentry' | 'allow_reentry' | 'reentry_after_period'
          re_entry_period_value?: number | null
          re_entry_period_unit?: string | null
          exit_conditions?: Json | null
          active_contacts?: number
          finished_contacts?: number
          certificates_issued?: number
          revenue?: number
          created_at?: string
          updated_at?: string
        }
      }
      flow_nodes: {
        Row: {
          id: string
          flow_id: string
          node_type:
            | 'trigger'
            | 'email'
            | 'sms'
            | 'whatsapp'
            | 'delay'
            | 'split'
            | 'update_contact'
            | 'update_list'
            | 'internal_alert'
            | 'webhook'
            | 'end'
          position_x: number
          position_y: number
          config: Json | null
          parent_node_id: string | null
          branch_label: string | null
          created_at: string
        }
        Insert: {
          id: string
          flow_id: string
          node_type:
            | 'trigger'
            | 'email'
            | 'sms'
            | 'whatsapp'
            | 'delay'
            | 'split'
            | 'update_contact'
            | 'update_list'
            | 'internal_alert'
            | 'webhook'
            | 'end'
          position_x?: number
          position_y?: number
          config?: Json | null
          parent_node_id?: string | null
          branch_label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          flow_id?: string
          node_type?:
            | 'trigger'
            | 'email'
            | 'sms'
            | 'whatsapp'
            | 'delay'
            | 'split'
            | 'update_contact'
            | 'update_list'
            | 'internal_alert'
            | 'webhook'
            | 'end'
          position_x?: number
          position_y?: number
          config?: Json | null
          parent_node_id?: string | null
          branch_label?: string | null
          created_at?: string
        }
      }
      flow_node_connections: {
        Row: {
          id: string
          flow_id: string
          source_node_id: string
          target_node_id: string
          branch_label: string | null
        }
        Insert: {
          id?: string
          flow_id: string
          source_node_id: string
          target_node_id: string
          branch_label?: string | null
        }
        Update: {
          id?: string
          flow_id?: string
          source_node_id?: string
          target_node_id?: string
          branch_label?: string | null
        }
      }
      flow_enrollments: {
        Row: {
          id: string
          org_id: string
          contact_id: string
          flow_id: string
          current_node_id: string | null
          status: 'active' | 'completed' | 'removed'
          entered_at: string
          exited_at: string | null
          exit_reason: string | null
        }
        Insert: {
          id?: string
          org_id: string
          contact_id: string
          flow_id: string
          current_node_id?: string | null
          status?: 'active' | 'completed' | 'removed'
          entered_at?: string
          exited_at?: string | null
          exit_reason?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          contact_id?: string
          flow_id?: string
          current_node_id?: string | null
          status?: 'active' | 'completed' | 'removed'
          entered_at?: string
          exited_at?: string | null
          exit_reason?: string | null
        }
      }
      sending_domains: {
        Row: {
          id: string
          org_id: string
          domain: string
          verification_status: 'verified' | 'pending'
          spf_status: 'ok' | 'pending'
          dkim_status: 'ok' | 'pending'
          dmarc_status: 'ok' | 'pending'
          dns_records: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          domain: string
          verification_status?: 'verified' | 'pending'
          spf_status?: 'ok' | 'pending'
          dkim_status?: 'ok' | 'pending'
          dmarc_status?: 'ok' | 'pending'
          dns_records?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          domain?: string
          verification_status?: 'verified' | 'pending'
          spf_status?: 'ok' | 'pending'
          dkim_status?: 'ok' | 'pending'
          dmarc_status?: 'ok' | 'pending'
          dns_records?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          org_id: string
          name: string
          key_hash: string
          key_prefix: string
          scope: 'full' | 'read_only'
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          key_hash: string
          key_prefix: string
          scope?: 'full' | 'read_only'
          last_used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          scope?: 'full' | 'read_only'
          last_used_at?: string | null
          created_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          org_id: string
          url: string
          events: string[]
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          url: string
          events: string[]
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          url?: string
          events?: string[]
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      suppression_list: {
        Row: {
          id: string
          org_id: string
          email: string
          reason: 'complaint' | 'hard_bounce' | 'unsubscribe' | 'soft_bounce_repeated'
          origin: string | null
          removable: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          reason: 'complaint' | 'hard_bounce' | 'unsubscribe' | 'soft_bounce_repeated'
          origin?: string | null
          removable?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          reason?: 'complaint' | 'hard_bounce' | 'unsubscribe' | 'soft_bounce_repeated'
          origin?: string | null
          removable?: boolean
          created_at?: string
        }
      }
      account_settings: {
        Row: {
          id: string
          org_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      media_folders: {
        Row: {
          id: string
          org_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          created_at?: string
        }
      }
      media_files: {
        Row: {
          id: string
          org_id: string
          name: string
          size_bytes: number
          file_type: string
          url: string
          folder_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          size_bytes: number
          file_type: string
          url: string
          folder_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          size_bytes?: number
          file_type?: string
          url?: string
          folder_id?: string | null
          created_at?: string
        }
      }
      email_events: {
        Row: {
          id: string
          org_id: string
          contact_id: string
          campaign_id: string | null
          flow_id: string | null
          flow_node_id: string | null
          event_type:
            | 'sent'
            | 'delivered'
            | 'opened'
            | 'clicked'
            | 'bounced'
            | 'spam_complaint'
            | 'unsubscribed'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          contact_id: string
          campaign_id?: string | null
          flow_id?: string | null
          flow_node_id?: string | null
          event_type:
            | 'sent'
            | 'delivered'
            | 'opened'
            | 'clicked'
            | 'bounced'
            | 'spam_complaint'
            | 'unsubscribed'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          contact_id?: string
          campaign_id?: string | null
          flow_id?: string | null
          flow_node_id?: string | null
          event_type?:
            | 'sent'
            | 'delivered'
            | 'opened'
            | 'clicked'
            | 'bounced'
            | 'spam_complaint'
            | 'unsubscribed'
          metadata?: Json | null
          created_at?: string
        }
      }
      course_events: {
        Row: {
          id: string
          org_id: string
          contact_id: string
          course_id: string
          enrollment_id: string | null
          event_type: 'started' | 'progress_updated' | 'completed' | 'certificate_issued'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          contact_id: string
          course_id: string
          enrollment_id?: string | null
          event_type: 'started' | 'progress_updated' | 'completed' | 'certificate_issued'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          contact_id?: string
          course_id?: string
          enrollment_id?: string | null
          event_type?: 'started' | 'progress_updated' | 'completed' | 'certificate_issued'
          metadata?: Json | null
          created_at?: string
        }
      }
      flow_step_logs: {
        Row: {
          id: string
          org_id: string
          contact_id: string
          flow_id: string
          flow_enrollment_id: string | null
          from_node_id: string | null
          to_node_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          contact_id: string
          flow_id: string
          flow_enrollment_id?: string | null
          from_node_id?: string | null
          to_node_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          contact_id?: string
          flow_id?: string
          flow_enrollment_id?: string | null
          from_node_id?: string | null
          to_node_id?: string | null
          created_at?: string
        }
      }
      inbound_webhook_events: {
        Row: {
          id: string
          org_id: string | null
          source: string
          event_type: string
          payload: Json | null
          status: 'pending' | 'processed' | 'failed'
          processed_at: string | null
          error_message: string | null
          retry_count: number
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          source: string
          event_type: string
          payload?: Json | null
          status?: 'pending' | 'processed' | 'failed'
          processed_at?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          source?: string
          event_type?: string
          payload?: Json | null
          status?: 'pending' | 'processed' | 'failed'
          processed_at?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          org_id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      daily_metrics_summary: {
        Row: {
          id: string
          org_id: string
          date: string
          emails_sent: number
          emails_delivered: number
          emails_opened: number
          emails_clicked: number
          emails_bounced: number
          spam_complaints: number
          unsubscribes: number
          new_contacts: number
          revenue: number
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          date: string
          emails_sent?: number
          emails_delivered?: number
          emails_opened?: number
          emails_clicked?: number
          emails_bounced?: number
          spam_complaints?: number
          unsubscribes?: number
          new_contacts?: number
          revenue?: number
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          date?: string
          emails_sent?: number
          emails_delivered?: number
          emails_opened?: number
          emails_clicked?: number
          emails_bounced?: number
          spam_complaints?: number
          unsubscribes?: number
          new_contacts?: number
          revenue?: number
          updated_at?: string
        }
      }
      campaign_metrics_summary: {
        Row: {
          id: string
          org_id: string
          campaign_id: string
          date: string
          sent: number
          delivered: number
          opened: number
          clicked: number
          bounced: number
          spam: number
          unsubscribed: number
          conversions: number
          revenue: number
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          campaign_id: string
          date: string
          sent?: number
          delivered?: number
          opened?: number
          clicked?: number
          bounced?: number
          spam?: number
          unsubscribed?: number
          conversions?: number
          revenue?: number
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          campaign_id?: string
          date?: string
          sent?: number
          delivered?: number
          opened?: number
          clicked?: number
          bounced?: number
          spam?: number
          unsubscribed?: number
          conversions?: number
          revenue?: number
          updated_at?: string
        }
      }
      flow_metrics_summary: {
        Row: {
          id: string
          org_id: string
          flow_id: string
          date: string
          entries: number
          completions: number
          exits: number
          emails_sent: number
          emails_opened: number
          emails_clicked: number
          revenue: number
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          flow_id: string
          date: string
          entries?: number
          completions?: number
          exits?: number
          emails_sent?: number
          emails_opened?: number
          emails_clicked?: number
          revenue?: number
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          flow_id?: string
          date?: string
          entries?: number
          completions?: number
          exits?: number
          emails_sent?: number
          emails_opened?: number
          emails_clicked?: number
          revenue?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
