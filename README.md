# fitcoach-pt-saas-app
Fitness Coach Personal Trainer SaaS platform

# CLI for running the copilot agent chat

/dotnet-microservice-k8s-cfk-flux --instructions .github/instructions/dotnet-architecture-good-practices.instructions.md subscription_id="95328200-66a3-438f-9641-aeeb101e5e37" tenant_id="f3c9952d-3ea5-4539-bd9a-7e1093f8a1b6" resource_group_name="" location="southeastasia" output_dir=./terraform-out prefer_import_blocks=false backend_type=local avm_only=false pin_versions=true


/dot-net-basic.prompt.md solution_dir=./fitcoach service_name=fitcoach db_provider=postgres kafka_topics=managment,workout,progress

- **solution_dir**: ${input:solution_dir:Relative folder for the new solution (e.g., ./services/FitCoach.Catalog)}
- **service_name**: ${input:service_name:Solution/namespace root (e.g., FitCoach.Catalog)}
- **db_provider**: ${input:db_provider:(postgres|sqlserver)}
- **kafka_topics**: ${input:kafka_topics:Comma-separated topics}

@workspace dot-net-basic.prompt.md solution_dir=./fitcoach service_name=fitcoach db_provider=postgres kafka_topics=managment,workout,progress