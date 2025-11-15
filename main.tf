variable "credentials_file" { default = "credentials-gcp.json" }
variable "project_id" { default = "isn2025-2" }
variable "region" { default = "southamerica-east1" }
variable "github_org" { default = "neuro-track" }
variable "service_name" { default = "frontend" }
variable "image" { default = "southamerica-east1-docker.pkg.dev/neuro-track/neuro-track-frontend/frontend" }
variable "port" { default = 8080 }
variable "allow_unauthenticated" {default = true}
variable "min_instances" { default = 0 }
variable "max_instances" { default = 3 }
variable "omdbapi_uri" {default = "http://www.omdbapi.com/"}
variable "omdbapi_key" {default = "af5bc4a5"}

# A variável 'mongodb_uri' foi removida, pois usaremos o Firestore

terraform {
    required_providers {
      google = {
        source = "hashicorp/google",
        version = ">= 7.10.0"
      }
    }
}

provider "google" {
    credentials = var.credentials_file
    project = var.project_id
    region = var.region
}

# 1. Cria o banco de dados Firestore Native (alta escalabilidade)
# O nome "(default)" é o padrão e a location_id deve ser a região para um DB regional.
resource "google_firestore_database" "database" {
    name         = "neuro2"
    location_id  = var.region
    type         = "FIRESTORE_NATIVE"
      database_edition        = "ENTERPRISE"
}

resource "google_cloud_run_v2_service" "service" {
    name = var.service_name
    location = var.region
    ingress = "INGRESS_TRAFFIC_ALL"
    deletion_protection = false
    template {
        containers {
            image = var.image
            ports { container_port = var.port }
            env {
                name = "API_KEY"
                value = var.omdbapi_key 
            }
            env {
                name  = "GOOGLE_CLOUD_PROJECT"
                value = var.project_id
            }
            env {
                name  = "GOOGLE_CLOUD_REGION"
                value = var.region
            }
            env {
                name  = "FIRESTORE_DATABASE"
                value = google_firestore_database.database.name
            }
            # 2. Configura a variável de ambiente para o Firestore.
            # Aplicativos modernos geralmente precisam apenas do ID do projeto
            # para se conectar ao Firestore via SDK.
            env {
                name = "FIRESTORE_PROJECT_ID"
                value = var.project_id
            }
        }
        scaling {
            min_instance_count = var.min_instances
            max_instance_count = var.max_instances
        }
    }
}
# 
# resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
#     count = var.allow_unauthenticated ? 1 : 0
#     project = var.project_id
#     location = var.region
#     name = google_cloud_run_v2_service.service.name
#     role = "roles/run.invoker"
#     member = "allUsers"
# }
# 
# output "service_name" { value = google_cloud_run_v2_service.service.name }
# output "service_uri" { value = google_cloud_run_v2_service.service.uri }